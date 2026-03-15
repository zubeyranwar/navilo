import { useParams } from "react-router-dom";

export default function UserProfilePage() {
    const { id } = useParams();
    return <h4>User Profile: {id}</h4>;
}
