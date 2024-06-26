import { createEventSource } from '@/fnConfig/eventSource/eventSource';

export function useEventSource() {
  return {
    createEventSource,
  };
}
