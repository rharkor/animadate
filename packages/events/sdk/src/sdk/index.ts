import { pushEvent } from "./push"
import { TPushEvent } from "./types"

const events = {
  /**
   * Push an event to the database
   * @description This function is not awaited to not slow down the request
   * @param params The event parameters
   */
  push: (params: TPushEvent) => {
    pushEvent(params)
  },
}

export default events
