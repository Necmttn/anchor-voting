import { NextPage } from "next";
import { Button, Input } from "antd";
import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createProposal } from "../solana";

const CreateCampaignPage: NextPage = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [campaign, setCampaign] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const setValue = (key: string, value: any) => {
    setCampaign({
      ...campaign,
      [key]: value,
    });
  };

  const handleCreateProposal = async () => {
    setLoading(true);
    await createProposal({
      title: campaign.name,
      description: campaign.description,
    });
    setLoading(false);
  };
  return (
    <div className={"w-full max-w-3xl mt-10"}>
      <div className={"shadow-lg bordered"}>
        <div className={"p-4"}>
          <div className={"mb-4"}>
            <h1 className={"text-lg font-bold"}>Create Proposal</h1>
          </div>
          <div className={"my-2"}>
            <label className={"label"} htmlFor={"Campaign Name"}>
              <span className={"label-text"}>Name</span>
            </label>
            <Input
              name={"name"}
              value={campaign.name}
              onChange={(e) => setValue("name", e.target.value)}
            />
          </div>
          <div className={"my-2"}>
            <label className={"label"} htmlFor={"Campaign Name"}>
              <span className={"label-text"}>Description</span>
            </label>
            <Input.TextArea
              value={campaign.description}
              onChange={(e) => setValue("description", e.target.value)}
            />
          </div>
          <Button onClick={handleCreateProposal}>Create Proposal</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignPage;
