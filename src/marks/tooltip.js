import {pointer, select} from "d3";
import {formatDefault} from "../format.js";
import {Mark} from "../mark.js";
import {maybeFrameAnchor, maybeTuple} from "../options.js";
import {applyFrameAnchor} from "../style.js";
import {inferTickFormat} from "./axis.js";

const defaults = {
  ariaLabel: "tooltip",
  fill: "none",
  stroke: "none"
};

export class Tooltip extends Mark {
  constructor(data, options = {}) {
    const {x, y, maxRadius = 40, frameAnchor} = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true}
      },
      options,
      defaults
    );
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
    this.indexesBySvg = new WeakMap();
    this.maxRadius = +maxRadius;
  }
  render(index, scales, {x: X, y: Y, channels}, dimensions, context) {
    const {fx, fy} = scales;
    const formatFx = fx && inferTickFormat(fx);
    const formatFy = fy && inferTickFormat(fy);
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const {maxRadius, fx: fxv, fy: fyv} = this;
    const {marginLeft, marginTop} = dimensions;
    const svg = context.ownerSVGElement;
    let indexes = this.indexesBySvg.get(svg);
    if (indexes) return void indexes.push(index);
    this.indexesBySvg.set(svg, (indexes = [index]));
    const dot = select(svg)
      .on("pointermove", (event) => {
        let i, xi, yi, fxi, fyi;
        if (event.buttons === 0) {
          const [xp, yp] = pointer(event);
          let ri = maxRadius * maxRadius;
          for (const index of indexes) {
            const fxj = index.fx;
            const fyj = index.fy;
            const oxj = fx ? fx(fxj) - marginLeft : 0;
            const oyj = fy ? fy(fyj) - marginTop : 0;
            for (const j of index) {
              const xj = (X ? X[j] : cx) + oxj;
              const yj = (Y ? Y[j] : cy) + oyj;
              const dx = xj - xp;
              const dy = yj - yp;
              const rj = dx * dx + dy * dy;
              if (rj <= ri) (i = j), (ri = rj), (xi = xj), (yi = yj), (fxi = fxj), (fyi = fyj);
            }
          }
        }
        if (i === undefined) {
          dot.attr("display", "none");
        } else {
          dot.attr("display", "inline");
          dot.attr("transform", `translate(${xi},${yi})`);
          const text = [];
          for (const key in channels) {
            const channel = channels[key];
            const label = scales[channel.scale]?.label ?? key;
            text.push(`${label} = ${formatDefault(channel.value[i])}`);
          }
          if (fxv != null) text.push(`${fx.label ?? "fx"} = ${formatFx(fxi)}`);
          if (fyv != null) text.push(`${fy.label ?? "fy"} = ${formatFy(fyi)}`);
          title.text(text.join("\n"));
        }
      })
      .on("pointerdown pointerleave", () => dot.attr("display", "none"))
      .append("g")
      .attr("display", "none")
      .attr("pointer-events", "all")
      .attr("fill", "none")
      .call((g) => g.append("circle").attr("r", maxRadius).attr("fill", "none"))
      .call((g) => g.append("circle").attr("r", 4.5).attr("stroke", "red").attr("stroke-width", 1.5));
    const title = dot.append("title");
    return null;
  }
}

export function tooltip(data, {x, y, ...options} = {}) {
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Tooltip(data, {...options, x, y});
}