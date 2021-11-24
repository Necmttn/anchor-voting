import {NextPage} from "next";
import {useRouter} from "next/router";

const CampaignPage: NextPage = () => {
  const router = useRouter()
  return (
    <div>
      <h1>Campaign {router.query.campaign_id}</h1>
    </div>
  )
}


export default CampaignPage;
