import { PointLight, DirectionalLight, DirectionalLightHelper, AmbientLight } from "three/webgpu";
import { BACKGROUND_LAYER, EDITOR_LAYER, INTERSECTION_LAYER, RENDER_LAYER } from "./Global";
import { getPointLightHelper } from "./objects/Custom/LightHelpers";

export const CREATE_LIGHT_TYPES = {
  AmbientLight: 0,
  PointLight: 1,
} as const;

export function CreateLight(lightData: Array<number>) {
  const lightType = lightData[0];
  const color = lightData[1];
  const intensity = lightData[2];
  let light;
  let helper;

  switch (lightType) {
    case CREATE_LIGHT_TYPES.AmbientLight: {
      light = new AmbientLight(color, intensity);
      light.name = "AmbientLight";
      break;
    }

    case CREATE_LIGHT_TYPES.PointLight: {
      light = new PointLight(color, intensity);
      helper = getPointLightHelper();
      helper.name = "PointLight";

      helper.add(light);

      light.userData.removable = false;
      light.userData.attachable = false;
      light.name = "Light";

      break;
    }

    default: {
      light = new DirectionalLight(color, intensity);
      helper = new DirectionalLightHelper(light);
      break;
    }

  }

  if (helper) {
    helper.layers.enable(EDITOR_LAYER);
    helper.layers.enable(INTERSECTION_LAYER);

    // If there is no helper, It would be good to have light in scene tree
    light.layers.enable(BACKGROUND_LAYER);
  }

  light.layers.enable(EDITOR_LAYER);
  light.layers.enable(RENDER_LAYER);

  if (helper) return helper;

  return light;
}
