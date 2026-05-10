import crypto from "crypto";
import slugify from "slugify";
import College from "../models/college.model.js";
import CollegeInvite from "../models/collegeInvite.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { ROLES } from "../constants/roles.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

const createJoinCode = () => {
  const partA = crypto.randomBytes(2).toString("hex").toUpperCase();
  const partB = crypto.randomBytes(1).toString("hex").toUpperCase();
  return `CBR-${partA}-${partB}`;
};

const createInviteCode = () => crypto.randomBytes(9).toString("base64url");

const ensureUniqueJoinCode = async () => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = createJoinCode();
    if (!(await College.exists({ joinCode: code }))) return code;
  }
  throw new ApiError(500, "Could not generate a unique college join code");
};

const getOwnerId = (college) => college.owner || college.createdBy;

export const createCollege = async (payload, user) => {
  if (user.college) throw new ApiError(409, "You already belong to a college");

  const college = await College.create({
    name: payload.name,
    slug: slugify(payload.name, { lower: true, strict: true }),
    description: payload.description,
    logo: payload.logo,
    bannerImage: payload.bannerImage,
    joinCode: await ensureUniqueJoinCode(),
    owner: user._id,
    admins: [user._id],
    createdBy: user._id,
    studentsCount: 1
  });

  await User.findByIdAndUpdate(user._id, { college: college._id, role: ROLES.COLLEGE_OWNER });
  return college;
};

export const joinCollege = async ({ joinCode, inviteCode }, user) => {
  if (user.college) throw new ApiError(409, "You already belong to a college");

  let college = null;
  let invite = null;

  if (inviteCode) {
    invite = await CollegeInvite.findOne({ code: inviteCode }).populate("college");
    if (!invite || invite.revokedAt) throw new ApiError(404, "Invalid invite link");
    if (invite.expiresAt && invite.expiresAt < new Date()) throw new ApiError(410, "Invite link expired");
    if (invite.maxUses && invite.uses >= invite.maxUses) throw new ApiError(410, "Invite usage limit reached");
    college = invite.college;
  } else {
    college = await College.findOne({ joinCode });
  }

  if (!college) throw new ApiError(404, "Invalid college join code");
  await User.findByIdAndUpdate(user._id, { college: college._id });
  college.studentsCount += 1;
  await college.save();
  if (invite) {
    invite.uses += 1;
    await invite.save();
  }
  return college;
};

export const getCollege = async (slug) => {
  const college = await College.findOne({ slug })
    .populate("owner", "name username profilePicture")
    .populate("admins", "name username profilePicture role");
  if (!college) throw new ApiError(404, "College not found");
  return college;
};

export const getMyCollege = async (user) => {
  if (!user.college) return null;
  const college = await College.findById(user.college)
    .populate("owner", "name username profilePicture")
    .populate("admins", "name username profilePicture role");
  if (college && !college.owner) {
    college.owner = college.createdBy;
    await college.save();
  }
  return college;
};

export const listColleges = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = query.q ? { $text: { $search: query.q } } : {};
  const [items, total] = await Promise.all([
    College.find(filter).sort({ studentsCount: -1 }).skip(skip).limit(limit).lean(),
    College.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const updateMemberRole = async (collegeId, actor, memberId, role) => {
  const college = await College.findById(collegeId);
  if (!college) throw new ApiError(404, "College not found");
  if (!getOwnerId(college).equals(actor._id) && actor.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only the college owner can manage roles");
  }

  const member = await User.findOne({ _id: memberId, college: collegeId });
  if (!member) throw new ApiError(404, "College member not found");
  if (member.role === ROLES.COLLEGE_OWNER) throw new ApiError(400, "Transfer ownership instead of changing owner role");

  member.role = role;
  await member.save();

  if (role === ROLES.COLLEGE_ADMIN && !college.admins.some((id) => id.equals(member._id))) {
    college.admins.push(member._id);
  }
  if (role === ROLES.STUDENT) {
    college.admins = college.admins.filter((id) => !id.equals(member._id));
  }
  await college.save();
  return member;
};

export const listMembers = async (collegeId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {
    college: collegeId,
    ...(query.q ? { $text: { $search: query.q } } : {})
  };
  const [items, total] = await Promise.all([
    User.find(filter).select("name username email role profilePicture branch year bio createdAt").sort({ role: 1, name: 1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter)
  ]);
  return { items, meta: buildPaginationMeta({ page, limit, total }) };
};

export const leaveCollege = async (user) => {
  if (!user.college) throw new ApiError(400, "You are not part of a college");
  const college = await College.findById(user.college);
  if (!college) throw new ApiError(404, "College not found");
  if (getOwnerId(college).equals(user._id)) {
    throw new ApiError(403, "Transfer ownership or delete the college before leaving");
  }

  college.admins = college.admins.filter((id) => !id.equals(user._id));
  college.studentsCount = Math.max(0, college.studentsCount - 1);
  await Promise.all([
    college.save(),
    User.findByIdAndUpdate(user._id, { $unset: { college: "" }, role: ROLES.STUDENT })
  ]);
};

export const removeMember = async (college, actor, memberId) => {
  const member = await User.findOne({ _id: memberId, college: college._id });
  if (!member) throw new ApiError(404, "College member not found");
  if (member._id.equals(actor._id)) throw new ApiError(400, "Use leave college instead");
  if (member.role === ROLES.COLLEGE_OWNER) throw new ApiError(403, "Transfer ownership before removing the owner");

  college.admins = college.admins.filter((id) => !id.equals(member._id));
  college.studentsCount = Math.max(0, college.studentsCount - 1);
  await Promise.all([
    college.save(),
    User.findByIdAndUpdate(member._id, { $unset: { college: "" }, role: ROLES.STUDENT })
  ]);
};

export const transferOwnership = async (college, newOwnerId) => {
  const nextOwner = await User.findOne({ _id: newOwnerId, college: college._id });
  if (!nextOwner) throw new ApiError(404, "New owner must be a college member");
  if (college.owner.equals(nextOwner._id)) return nextOwner;

  const previousOwnerId = getOwnerId(college);
  college.owner = nextOwner._id;
  if (!college.admins.some((id) => id.equals(nextOwner._id))) college.admins.push(nextOwner._id);
  college.admins = college.admins.filter((id) => !id.equals(previousOwnerId));

  await Promise.all([
    college.save(),
    User.findByIdAndUpdate(previousOwnerId, { role: ROLES.COLLEGE_ADMIN }),
    User.findByIdAndUpdate(nextOwner._id, { role: ROLES.COLLEGE_OWNER })
  ]);

  return nextOwner;
};

export const createInvite = async (college, user, payload) => {
  const expiresAt = payload.expiresInHours
    ? new Date(Date.now() + payload.expiresInHours * 60 * 60 * 1000)
    : undefined;

  const invite = await CollegeInvite.create({
    college: college._id,
    code: createInviteCode(),
    createdBy: user._id,
    expiresAt,
    maxUses: payload.maxUses
  });

  return invite;
};

export const listInvites = (collegeId) =>
  CollegeInvite.find({ college: collegeId }).sort({ createdAt: -1 }).populate("createdBy", "name username profilePicture");

export const revokeInvite = async (collegeId, inviteId) => {
  const invite = await CollegeInvite.findOneAndUpdate(
    { _id: inviteId, college: collegeId, revokedAt: null },
    { revokedAt: new Date() },
    { new: true }
  );
  if (!invite) throw new ApiError(404, "Active invite not found");
  return invite;
};

export const updateCollegeProfile = async (college, payload) => {
  if (payload.name && payload.name !== college.name) {
    const duplicate = await College.exists({ name: payload.name, _id: { $ne: college._id } });
    if (duplicate) throw new ApiError(409, "College name already exists");
    college.slug = slugify(payload.name, { lower: true, strict: true });
  }

  Object.assign(college, payload);
  await college.save();
  return College.findById(college._id)
    .populate("owner", "name username profilePicture")
    .populate("admins", "name username profilePicture role");
};

export const uploadCollegeImage = async (college, file, field) => {
  const uploaded = await uploadBufferToCloudinary(file, `campusbridge/colleges/${college._id}`);
  college[field] = uploaded.url;
  await college.save();
  return { college, upload: uploaded };
};
