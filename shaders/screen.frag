// Shaders TV Screen Fragment Shader
// P-slice engine v1.0.4
// TV Screen Effect with CRT simulation

#version 330 core

in vec2 TexCoord;
out vec4 FragColor;

uniform sampler2D screenTexture;
uniform float time;
uniform vec2 resolution;
uniform float scanlineIntensity = 0.15;
uniform float vignette = 0.3;
uniform float distortion = 0.02;
uniform bool enableCRT = true;
uniform bool enableScanlines = true;
uniform bool enableVignette = true;
uniform float brightness = 1.0;
uniform float contrast = 1.0;
uniform float saturation = 1.0;

// CRT Distortion function
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

// Scanline effect
float scanlines(vec2 uv) {
    if (!enableScanlines) return 1.0;
    
    float freq = resolution.y * 0.5;
    float scanline = sin(uv.y * freq * 6.28318) * 0.5 + 0.5;
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

// Vignette effect
float vignetteEffect(vec2 uv) {
    if (!enableVignette) return 1.0;
    
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float dist = length(delta);
    float vig = 1.0 - smoothstep(0.0, vignette, dist);
    return mix(1.0, vig, 0.4);
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

// TV Screen noise (optional)
float tvNoise(vec2 uv, float seed) {
    return fract(sin(dot(uv + seed, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    // Apply CRT distortion
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
    
    // Apply scanlines
    color *= scanlines(uv);
    
    // Apply vignette
    color *= vignetteEffect(TexCoord);
    
    // Apply color corrections
    color = colorCorrection(color);
    
    // Add slight TV noise
    float noise = tvNoise(TexCoord, time) * 0.02;
    color += vec3(noise);
    
    // Add screen glitch effect (optional)
    if (sin(time * 3.0) > 0.98) {
        color += vec3(0.1, 0.0, 0.0);
    }
    
    // TV screen edge effect
    float edge = length(abs(TexCoord - 0.5) * 2.0);
    color *= 1.0 - edge * 0.1;
    
    FragColor = vec4(color, 1.0);
}
