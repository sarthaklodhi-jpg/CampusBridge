import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userApi } from "../api/endpoints";
import Loader from "../components/common/Loader";
import ProfileHeader from "../components/profile/ProfileHeader";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  useEffect(() => { userApi.profile(username).then(({ data }) => setProfile(data.data.user)); }, [username]);
  if (!profile) return <Loader />;
  return <ProfileHeader user={profile} />;
}
