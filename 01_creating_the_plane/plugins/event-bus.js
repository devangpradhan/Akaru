import { EventBus } from 'assets/js/utils/event-bus';

export default (context, inject) => {
  inject('bus', EventBus);
};
