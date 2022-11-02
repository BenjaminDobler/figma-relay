// https://www.figma.com/file/gohZuvON9qmHoSnEYsW5Vo/HelloFigma?node-id=0%3A1

import axios from "axios";
import { ensureDirSync, writeFileSync } from "fs-extra";
import * as Figma from "figma-api";
import { Node, CANVAS } from "figma-api";
import { join } from "path";

const outDir = "./output";
let assetDir = "./output/assets/";
let relativeAssetDir = "";
const relayPluginID = "1041056822461507786";

export interface ColorStyle {
  r: number;
  g: number;
  b: number;
  a: number;
}

async function downloadFile(source: string, destination: string) {
  const res = await axios.get(source, { responseType: "arraybuffer" });
  writeFileSync(destination, res.data);
}

const color2Css = (color: ColorStyle) => {
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(
    color.g * 255
  )},${Math.round(color.b * 255)}, ${color.a})`;
};

async function transformComponent(node: any) {
  const transformNode = async (node: any, css: any, parent?: any) => {
    const renderNode: any = {};

    renderNode.originalNode = node;

    node.originalName = node.name;
    if (node.name.includes('=')) { // it is a variant!?
      node.name = node.name.split('=')[1];
    }

    const nodeID =
      node.name.split(" ").join("-").toLowerCase() +
      "-" +
      node.id.replace(":", "-");

    renderNode.id = nodeID;
    renderNode.type = node.type;
    renderNode.name = node.name;
    renderNode.parameters = [];
    renderNode.inputs = [];


    if (node.pluginData && node.pluginData[relayPluginID]) {
      const relayData = node.pluginData[relayPluginID];
      if (relayData.parameters) {
        const parameters = JSON.parse(relayData.parameters);
        renderNode.parameters = parameters;
      }

      if (relayData.interactions) {
        const interactions = JSON.parse(relayData.interactions);
        renderNode.interactions = interactions;
        console.log(interactions);
      }
    }

    let nodeCSS: any = {};

    nodeCSS["box-sizing"] = "border-box";

    if (node.type === "ELLIPSE") {
      if (node.absoluteBoundingBox.width === node.absoluteBoundingBox.height) {
        nodeCSS['border-radius'] = '50%';
      }
    }

    if (node.type === "RECTANGLE") {
      const bgFill = node.fills.find((fill: any) => fill.type === "SOLID");
      if (bgFill) {
        nodeCSS["background-color"] = color2Css(bgFill.color);
      }

      /*
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      */
      if (node.effects) {
        const dropShadow = node.effects.find(
          (effect: any) => effect.type === "DROP_SHADOW"
        );
        if (dropShadow) {
          nodeCSS['box-shadow'] = `${dropShadow.offset.x}px ${dropShadow.offset.y}px ${dropShadow.radius}px ${color2Css(dropShadow.color)}`;
        }
      }
    }

    if (node.type === "STAR" || node.type === "REGULAR_POLYGON") {
      if (node.fillGeometry) {
        const geometry = node.fillGeometry[0];
        const shape: any = {};
        shape.path = geometry.path;

        const imageFill = node.fills.find((fill: any) => fill.type === "IMAGE");
        if (imageFill) {
          imageFill.imageRef;
          shape.imagePattern = {
            url: `${relativeAssetDir}/${imageFill.imageRef}.png`,
          };
        } else {
          const solidFill = node.fills.find(
            (fill: any) => fill.type === "SOLID"
          );
          shape.fillColor = color2Css(solidFill.color);
        }

        renderNode.shapes = [shape];
      }
    }

    if (node.type === "TEXT") {
      nodeCSS["font-family"] = node.style.fontFamily;
      nodeCSS["font-weight"] = node.style.fontWeight;
      nodeCSS["font-size"] = node.style.fontSize + "px";
      renderNode.content = node.characters;
      //           "fontPostScriptName": "MontserratRoman-Bold",
      //           "textAutoResize": "WIDTH_AND_HEIGHT",
      //           "textAlignHorizontal": "LEFT",
      //           "textAlignVertical": "TOP",
      //           "letterSpacing": 0,
      //           "lineHeightPx": 28.125,
      //           "lineHeightPercent": 100,
      //           "lineHeightUnit": "INTRINSIC_%"

      // node.charachter is the content!
    }

    const imageFill = node.fills.find((fill: any) => fill.type === "IMAGE");
    if (imageFill && !renderNode.shapes) {
      imageFill.imageRef;
      nodeCSS.background = `url(${relativeAssetDir}/${imageFill.imageRef}.png)`;
      nodeCSS["background-size"] = "cover!important";
      nodeCSS["background-position"] = "center!important";

      const imageContentParameter = renderNode.parameters.find((param: any)=>param.property === 'image-content');
      if (imageContentParameter) {
        renderNode.inputs.push({
          name: imageContentParameter.name,
          type: 'string',
          bindingType: "STYLE",
          bindingName: "background",
          bindingFunction: (val: string)=>{
            return `'url('+${val}+')'`;
          },
          default: `'${relativeAssetDir}/${imageFill.imageRef}.png'`,
        });
      }
    }

    if (node.cornerRadius) {
      nodeCSS["border-radius"] = node.cornerRadius + "px";
      const borderRadiusParameter = renderNode.parameters.find(
        (p: any) => p.property === "border-radius"
      );
      if (borderRadiusParameter) {
        renderNode.inputs.push({
          name: borderRadiusParameter.name,
          type: borderRadiusParameter.type,
          bindingType: "STYLE",
          bindingName: "borderRadius",
          bindingUnit: "px",
          default: node.cornerRadius,
        });
      }
    }

    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      const borderColor = color2Css(stroke.color);
      nodeCSS.border = node.strokeWeight + "px solid " + borderColor;
    }

    if (node.layoutMode && node.layoutMode !== "NONE") {
      // we have autolayout
      renderNode.autoLayout = true;
      nodeCSS.display = "inline-flex";
      nodeCSS["flex-direction"] =
        node.layoutMode === "VERTICAL" ? "column" : "row";
      if (node.itemSpacing) {
        nodeCSS.gap = node.itemSpacing + "px";
      }
    } else if (parent && !parent.autoLayout) {
      renderNode.autoLayout = false;

      nodeCSS.position = "absolute";

      let x = node.absoluteBoundingBox.x;
      if (parent) {
        x -= parent.originalNode.absoluteBoundingBox.x;
      }

      let y = node.absoluteBoundingBox.y;
      if (parent) {
        y -= parent.originalNode.absoluteBoundingBox.y;
      }

      nodeCSS.left = x + "px";
      nodeCSS.top = y + "px";
    } else {
      nodeCSS.position = "relative";
    }
    nodeCSS.width = node.absoluteBoundingBox.width + "px";
    nodeCSS.height = node.absoluteBoundingBox.height + "px";

    if (
      ((node.paddingLeft === node.paddingRight) === node.paddingBottom) ===
      node.paddingTop
    ) {
      nodeCSS.padding = node.paddingLeft - node.strokeWeight + "px";
    } else {
      if (node.paddingLeft) {
        nodeCSS["padding-left"] = node.paddingLeft - node.strokeWeight + "px";
      }
      if (node.paddingRight) {
        nodeCSS["padding-right"] = node.paddingRight - node.strokeWeight + "px";
      }
      if (node.paddingTop) {
        nodeCSS["padding-top"] = node.paddingTop - node.strokeWeight + "px";
      }
      if (node.paddingBottom) {
        nodeCSS["padding-bottom"] =
          node.paddingBottom - node.strokeWeight + "px";
      }
    }

    if (node.backgroundColor) {
      nodeCSS["background-color"] = color2Css(node.backgroundColor);

      const bgColorParameter = renderNode.parameters.find(
        (p: any) => p.property === "background-color"
      );
      if (bgColorParameter) {
        renderNode.inputs.push({
          name: bgColorParameter.name,
          type: "string", // the relay plugin has type color
          bindingType: "STYLE",
          bindingName: "backgroundColor",
          bindingUnit: "",
          default: `'${color2Css(node.backgroundColor)}'`,
        });
      }
    }

    css[nodeID] = nodeCSS;

    renderNode.css = nodeCSS;
    renderNode.children = [];

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const childResult = await transformNode(
          node.children[i],
          css,
          renderNode
        );
        renderNode.children.push(childResult.renderNode);
      }
    }

    return { renderNode };
  };

  const css: any = {};
  const transformResult = await transformNode(node, css);

  return transformResult;
}

export async function getComponent(
  aDir: string,
  relativeADir: string,
  fileKey: string,
  token: string
) {
  const api = new Figma.Api({
    personalAccessToken: token,
  });

  relativeAssetDir = relativeADir;
  assetDir = aDir;

  const file = await api.getFile(fileKey, {
    plugin_data: relayPluginID,
    geometry: "paths",
  });

  console.log(file);

  ensureDirSync(assetDir);
  const imageFills = await api.getImageFills(fileKey);
  if (imageFills.meta) {
    for (let file in imageFills.meta.images) {
      const url = imageFills.meta.images[file] as string;
      await downloadFile(url, join(assetDir, `${file}.png`));
    }
  }

  const canvases = file.document.children.filter((child: Node) =>
    Figma.isNodeType(child, "CANVAS")
  ) as CANVAS[];
  const components = canvases[0].children.filter(
    (child: Node) => child.type === "COMPONENT"
  );

  const componentSets = canvases[0].children.filter(
    (child: Node) => child.type === "COMPONENT_SET"
  );

  const transformedComponentSets = [];
  for (let componentSet of componentSets) {
    const set: any = {
      components: [],
      original: componentSet
    }
    for (let component of (componentSet as any).children) {
      const transformResult = await transformComponent(component);
      set.components.push(transformResult);
    }
    transformedComponentSets.push(set);
  }

  const componentTransforms = [];
  for (let component of components) {
    const transformResult = await transformComponent(component);
    componentTransforms.push(transformResult);
  }
  return {
    components: componentTransforms,
    componentSets: transformedComponentSets
  };
}
