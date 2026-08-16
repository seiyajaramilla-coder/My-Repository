// Shaders TV Screen Fragment Shader
// P-slice engine v1.0.4
// TV Screen Effect with CRT simulation and curved scanlines

#version 330 core

in vec2 TexCoord;
out vec4 FragColor;

uniform sampler2D screenTexture;
uniform float time;
uniform vec2 resolution;
uniform float scanlineIntensity = 0.15;
uniform float vignette = 0.3;
uniform float distortion = 0.02;
uniform float curvature = 0.15;
uniform bool enableCRT = true;
uniform bool enableScanlines = true;
uniform bool enableVignette = true;
uniform bool enableCurvature = true;
uniform float brightness = 1.0;
uniform float contrast = 1.0;
uniform float saturation = 1.0;

// Advanced CRT Barrel Distortion with curvature
vec2 crtDistortion(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float r = sqrt(dot(delta, delta));
    
    if (enableCRT && enableCurvature) {
        // Barrel distortion combined with curvature
        float factor = 1.0 + (distortion + curvature * 0.5) * r * r;
        return center + delta / factor;
    } else if (enableCRT) {
        float factor = 1.0 + distortion * r * r;
        return center + delta / factor;
    }
    return uv;
}

// Curved scanlines that follow screen geometry
float curvedScanlines(vec2 uv) {
    if (!enableScanlines) return 1.0;
    
    // Apply curvature to scanline position
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float curveFactor = 1.0 + curvature * length(delta);
    
    // Create scanlines that curve with the screen
    float freq = resolution.y * 0.5 * curveFactor;
    float scanline = sin(uv.y * freq * 6.28318) * 0.5 + 0.5;
    
    // Add horizontal curve distortion to scanlines
    float curveWarp = sin(uv.x * 3.14159) * 0.02;
    scanline = sin((uv.y + curveWarp) * freq * 6.28318) * 0.5 + 0.5;
    
    return mix(1.0, scanline, scanlineIntensity);
}

// Screen curve grid pattern (like traditional TV screens)
vec3 screenCurvePattern(vec3 color, vec2 uv) {
    if (!enableCurvature) return color;
    
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float dist = length(delta);
    
    // Create subtle curved grid pattern
    float gridX = sin(uv.x * 120.0) * 0.02;
    float gridY = sin(uv.y * 120.0) * 0.02;
    float grid = abs(gridX) + abs(gridY);
    
    // Apply curve-based intensity
    float curveIntensity = dist * curvature * 0.3;
    color -= vec3(grid * curveIntensity * 0.15);
    
    return color;
}

// CRT Phosphor grid with curvature compensation
vec3 crtPhosphor(vec3 color, vec2 uv) {
    vec2 pixelPos = fract(uv * resolution);
    
    // RGB phosphor mask
    vec3 mask = vec3(1.0);
    float phosphorSize = 3.0;
    
    mask.r = sin(pixelPos.x * 3.14159 * phosphorSize) * 0.5 + 0.5;
    mask.g = sin(pixelPos.x * 3.14159 * phosphorSize + 2.0943) * 0.5 + 0.5;
    mask.b = sin(pixelPos.x * 3.14159 * phosphorSize + 4.1887) * 0.5 + 0.5;
    
    return color * mask * 0.75 + color * 0.25;
}

// Vignette effect with curved edges
float vignetteEffect(vec2 uv) {
    if (!enableVignette) return 1.0;
    
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float dist = length(delta);
    
    // Smooth vignette following screen curve
    float vigAmount = vignette + (curvature * 0.2);
    float vig = 1.0 - smoothstep(0.0, vigAmount, dist);
    return mix(1.0, vig, 0.4);
}

// Screen edge highlight (like TV bezel)
float screenEdgeHighlight(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float dist = length(delta);
    
    // Curved screen edge
    float edge = dist * 2.0;
    float edgeEffect = smoothstep(0.95, 1.0, edge);
    
    return 1.0 - edgeEffect * 0.3;
}

// Curved screen reflection (optional glass glare)
vec3 curvedReflection(vec2 uv, vec3 color) {
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float dist = length(delta);
    
    // Curved reflection effect
    float reflection = sin(dist * 10.0) * 0.1;
    reflection = max(0.0, reflection);
    
    vec3 glare = vec3(reflection);
    return color + glare * 0.05;
}

// Color adjustment
vec3 colorCorrection(vec3 color) {
    // Brightness
    color *= brightness;
    
    // Contrast
    color = (color - 0.5) * contrast + 0.5;
    
    // Saturation
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, saturation);
    
    return clamp(color, 0.0, 1.0);
}

// TV Screen noise
float tvNoise(vec2 uv, float seed) {
    return fract(sin(dot(uv + seed, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    // Apply CRT distortion with curvature
    vec2 uv = crtDistortion(TexCoord);
    
    // Clamp to texture bounds
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    
    // Sample screen texture
    vec3 color = texture(screenTexture, uv).rgb;
    
    // Apply CRT phosphor grid
    if (enableCRT) {
        color = crtPhosphor(color, uv);
    }
    
    // Apply curved scanlines
    color *= curvedScanlines(uv);
    
    // Apply screen curve pattern
    color = screenCurvePattern(color, uv);
    
    // Apply vignette with curved edges
    color *= vignetteEffect(TexCoord);
    
    // Apply screen edge highlight
    color *= screenEdgeHighlight(TexCoord);
    
    // Apply color corrections
    color = colorCorrection(color);
    
    // Add curved reflection effect
    color = curvedReflection(TexCoord, color);
    
    // Add slight TV noise
    float noise = tvNoise(TexCoord, time) * 0.02;
    color += vec3(noise);
    
    // Add screen glitch effect
    if (sin(time * 3.0) > 0.98) {
        color += vec3(0.1, 0.0, 0.0);
    }
    
    // TV screen curve effect
    float edge = length(abs(TexCoord - 0.5) * 2.0);
    color *= 1.0 - edge * 0.1;
    
    FragColor = vec4(color, 1.0);
}
