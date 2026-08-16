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

// Screen curve transformation (bend the screen like a CRT)
vec2 applyCurve(vec2 uv) {
    if (!enableCurvature) return uv;
    
    // Normalize coordinates to center
    vec2 centered = uv - 0.5;
    
    // Apply barrel curvature
    float r = length(centered);
    float theta = atan(centered.y, centered.x);
    
    // Curve strength increases with distance from center
    float curve = r * r * curvature;
    r = r + curve;
    
    // Convert back from polar coordinates
    vec2 curved = vec2(
        r * cos(theta) + 0.5,
        r * sin(theta) + 0.5
    );
    
    return curved;
}

// CRT Barrel Distortion
vec2 crtDistortion(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float r = sqrt(dot(delta, delta));
    
    if (enableCRT) {
        float factor = 1.0 + distortion * r * r;
        return center + delta / factor;
    }
    return uv;
}

// Curved scanlines that follow screen curvature
float curvedScanlines(vec2 uv) {
    if (!enableScanlines) return 1.0;
    
    // Base scanline frequency
    float freq = resolution.y * 0.5;
    
    // Add curvature warp to scanlines
    float curveWarp = 0.0;
    if (enableCurvature) {
        vec2 center = vec2(0.5, 0.5);
        float distFromCenter = length(uv - center);
        curveWarp = sin(uv.x * 3.14159) * 0.05 * curvature * distFromCenter;
    }
    
    // Create scanlines with curve warp
    float scanline = sin((uv.y + curveWarp) * freq * 6.28318) * 0.5 + 0.5;
    
    return mix(1.0, scanline, scanlineIntensity);
}

// CRT Phosphor grid
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

// Screen edge highlight (like TV bezel with curve)
float screenEdgeHighlight(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float dist = length(delta);
    
    // Curved screen edge based on curvature
    float edgeThreshold = 0.9 + (curvature * 0.1);
    float edge = dist * 2.0;
    float edgeEffect = smoothstep(edgeThreshold, 1.0, edge);
    
    return 1.0 - edgeEffect * 0.3;
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
    vec2 uv = TexCoord;
    
    // Apply screen curve transformation
    if (enableCurvature) {
        uv = applyCurve(uv);
    }
    
    // Apply CRT distortion
    uv = crtDistortion(uv);
    
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
    
    // Apply vignette with curved edges
    color *= vignetteEffect(uv);
    
    // Apply screen edge highlight
    color *= screenEdgeHighlight(uv);
    
    // Apply color corrections
    color = colorCorrection(color);
    
    // Add slight TV noise
    float noise = tvNoise(TexCoord, time) * 0.02;
    color += vec3(noise);
    
    // Add screen glitch effect
    if (sin(time * 3.0) > 0.98) {
        color += vec3(0.1, 0.0, 0.0);
    }
    
    // TV screen curve edge darkening
    float edge = length(abs(TexCoord - 0.5) * 2.0);
    color *= 1.0 - edge * 0.1;
    
    FragColor = vec4(color, 1.0);
}
