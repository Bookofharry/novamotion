import { EnhancePromptRequest, EnhancePromptResponse } from '@videolab/shared';

const CAMERA_DIRECTIONS: Record<string, string> = {
  'pan-left': 'Slow horizontal camera pan from right to left, smooth parallax motion',
  'pan-right': 'Continuous fluid camera pan from left to right, maintaining focal framing',
  'zoom-in': 'Subtle slow dolly-in push towards the central subject, shallow depth of field',
  'zoom-out': 'Cinematic crane pull-back revealing expansive atmospheric scenery',
  'drone-shot': 'Sweeping high-altitude aerial drone perspective, majestic glide',
  'orbital': 'Smooth 360-degree orbital rotational tracking shot around the subject',
};

const STYLE_PRESETS: Record<string, { lighting: string; tone: string; aesthetic: string }> = {
  'cinematic': {
    lighting: 'Volumetric cinematic anamorphic lighting, warm golden hour accents, subtle atmospheric haze',
    tone: '35mm film grain, 8k resolution, award-winning cinematography, photorealistic render',
    aesthetic: 'highly detailed textures, masterpiece, IMAX quality'
  },
  'cyberpunk': {
    lighting: 'Vibrant neon purple and electric teal illumination, rain reflections on asphalt, high contrast rim lighting',
    tone: 'Dystopian futuristic ambiance, glowing holographic reflections, dense atmospheric fog',
    aesthetic: 'Blade Runner 2049 aesthetic, octane render, intricate cybernetic details'
  },
  'anime': {
    lighting: 'Soft cel-shaded radiant sunlight, whimsical pastel glow, lens flare accents',
    tone: 'Makoto Shinkai aesthetic, Studio Ghibli inspired painterly composition',
    aesthetic: 'expressive anime visual flair, clean line work, vibrant color palette'
  },
  'photorealistic': {
    lighting: 'Natural overcast diffused daylight, true-to-life reflections and subsurface scattering',
    tone: 'Shot on ARRI Alexa LF, 50mm f/1.4 prime lens, immaculate photorealism',
    aesthetic: 'crisp ultra-realistic textures, natural physics, uncompressed RAW look'
  },
  '3d-render': {
    lighting: 'Studio key and fill lighting with soft bounce, raytraced ambient occlusion',
    tone: 'Pixar/Disney 3D animation standard, rich tactile materials, stylized proportions',
    aesthetic: 'smooth subsurface scattering, Unreal Engine 5 render, clean topology'
  },
  'fantasy': {
    lighting: 'Ethereal bioluminescent ambient glow, shimmering magical particles drifting in air',
    tone: 'Mystical ancient wonderland, mythical grand scale, dreamlike chromatic harmony',
    aesthetic: 'Lord of the Rings epic grandeur, otherworldly wonder, breathtaking scope'
  }
};

export class PromptEnhancerService {
  enhance(request: EnhancePromptRequest): EnhancePromptResponse {
    const styleKey = request.stylePreset || 'cinematic';
    const cameraKey = request.cameraMovement || 'zoom-in';

    const style = STYLE_PRESETS[styleKey] || STYLE_PRESETS['cinematic'];
    const camera = CAMERA_DIRECTIONS[cameraKey] || CAMERA_DIRECTIONS['zoom-in'];

    const cleanInput = request.prompt.trim().replace(/\.$/, '');

    const enhancedPrompt = `${cleanInput}. ${camera}. ${style.lighting}. ${style.tone}. ${style.aesthetic}.`;

    const suggestedNegative = 'jitter, morphing artifacts, low quality, blurry, watermark, text overlay, distorted limbs, flicker, glitch';

    return {
      originalPrompt: request.prompt,
      enhancedPrompt,
      cameraMovement: camera,
      lightingDetails: style.lighting,
      suggestedNegativePrompt: suggestedNegative,
    };
  }
}

export const promptEnhancerService = new PromptEnhancerService();
