// Shaders TV Screen Vertex Shader
// P-slice engine v1.0.4
// TV Screen Effect Vertex Processor

#version 330 core

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 texCoord;

out vec2 TexCoord;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

void main() {
    // Standard vertex transformation
    gl_Position = projection * view * model * vec4(position, 1.0);
    TexCoord = texCoord;
}
