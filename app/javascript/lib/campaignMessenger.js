import { getConsumer } from "./actionCable";
import Eventer from "./Eventer";

class CampaignMessenger extends Eventer {
  constructor(userId, campaignId, gameId) {
    super();

    this.userId = userId;
    this.campaignId = campaignId;
    this.gameId = gameId;

    const subParams = {
      channel: "CampaignChannel",
      campaign_id: this.campaignId
    };

    this.consumer = getConsumer();

    this.channel = this.consumer.subscriptions.create(subParams, {
      received: msg => this.handleMessage(msg)
    });
  }

  handleMessage(msg) {
    if (msg.action === "beckon" && msg.userId !== this.userId) {
      this.trigger("beckon", msg);
    }
  }

  beckon(level, x, y, zoom) {
    this.channel.perform("beckon", {
      userId: this.userId,
      gameId: this.gameId,
      level,
      x,
      y,
      zoom
    });
  }
}


export {
  CampaignMessenger
};