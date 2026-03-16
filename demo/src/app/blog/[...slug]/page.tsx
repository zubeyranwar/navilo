import { useParams } from "react-router-dom";

export default function BlogPostPage() {
    const params = useParams();
    return <h5>Blog Post: {params.slug}</h5>;
}
