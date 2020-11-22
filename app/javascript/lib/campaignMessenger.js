import { getConsumer } from "./actionCable";
import Eventer from "./Eventer";

class CampaignMessenger extends Eventer {
  constructor(userId, campaignId, gameId) {
    super();

    this.userId = userId;
    this.campaignId = campaignId;
    this.gameId = gameId || null;

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
    } else if (msg.action === "updated") {
      this.trigger("updated", msg.campaign);
    }
  }

  beckon(level, x, y, zoom) {
    if (this.gameId === null) {
      throw "No gameId set";
    }

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