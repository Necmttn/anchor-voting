import { useWallet } from "@solana/wallet-adapter-react";
import { Button, DatePicker, Input, message, Modal } from "antd";
import React from "react";
import { createProposal } from "../solana";
import moment from "moment";

export const CreateProposalModal = () => {
  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const { connected } = useWallet();
  const [campaign, setCampaign] = React.useState({
    title: "",
    description: "",
    timeEnd: moment().endOf("day").unix(),
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
        timeEnd: campaign.timeEnd,
      });
      setCampaign({
        title: "",
        description: "",
        timeEnd: moment().endOf("day").unix(),
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

  function disabledDate(current: any) {
    // Can not select days before today and today
    return current && current < moment().endOf("day");
  }
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
        <div className={"my-2 flex flex-col"}>
          <label className={"label"} htmlFor={"Campaign Name"}>
            <span className={"label-text"}>Deadline</span>
          </label>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            onOk={(e) => setValue("timeEnd", e?.unix())}
            disabledDate={disabledDate}
          />
        </div>
      </Modal>
    </>
  );
};
