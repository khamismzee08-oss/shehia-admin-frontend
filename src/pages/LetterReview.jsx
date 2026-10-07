import { useNavigate,useParams } from "react-router-dom";
import LetterReviewComponent from "../components/letters/LetterReview";
export default function LetterReviewPage(){const {referenceNumber}=useParams();const navigate=useNavigate();return <LetterReviewComponent refNo={referenceNumber} onBack={()=>navigate("/letters")} onSaved={()=>navigate("/letters")}/>;}
