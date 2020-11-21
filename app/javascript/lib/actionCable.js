import * as cable from "@rails/actioncable";

let actioncableConsumer = null;

export function getConsumer() {
  if (actioncableConsumer === null) {
    actioncableConsumer = cable.createConsumer();
  }
  return actioncableConsumer;
}