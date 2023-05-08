import type {ChannelValueSpec} from "../channel.js";
import type {CompoundMark, Data, MarkOptions} from "../mark.js";

/** Options for the crosshair mark. */
export interface CrosshairOptions extends MarkOptions {
  /**
   * The horizontal position channel specifying the crosshair’s center,
   * typically bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the crosshair’s center, typically
   * bound to the *y* scale.
   */
  y?: ChannelValueSpec;
}

/** TODO */
export function crosshair(data?: Data, options?: CrosshairOptions): CompoundMark;