import { useWallet } from "@solana/wallet-adapter-react";
import { Button, Input, message, Modal } from "antd";
import React from "react";
import { createProposal } from "../solana";

export const CreateProposalModal = () => {
  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const { connected, connect } = useWallet();
  const [campaign, setCampaign] = React.useState({
    title: "",
    description: "",
  });
  const setValue = (key: string, value: any) => {
    setCampaign({
      ...campaign,
      [key]: value,
    });
  };

  const showModal = async () => {
    if (!connected) {
      message.warn("Connect the wallet first !");
      return;
    }
    setVisible(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      await createProposal({
        title: campaign.title,
        description: campaign.description,
      });
      setCampaign({
        title: "",
        description: "",
      });
      setVisible(false);
    } catch (err) {
      message.error((err as Error)?.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Create Proposal
      </Button>
      <Modal
        title="Create Proposal"
        visible={visible}
        okText={"Create Proposal"}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <div className={"my-2"}>
          <label className={"label"} htmlFor={"Campaign Name"}>
            <span className={"label-text"}>Title</span>
          </label>
          <Input
            name={"name"}
            value={campaign.title}
            onChange={(e) => setValue("title", e.target.value)}
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
      </Modal>
    </>
  );
};
