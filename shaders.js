// Vertex Shader Source
var vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

// Fragment Shaders
var plasmaFragmentShader = `
     precision mediump float;
 varying vec2 v_uv;
 uniform float u_time;
 uniform vec2 u_resolution;

 void main() {
     vec2 uv = v_uv * u_resolution / min(u_resolution.x, u_resolution.y);

     // Use sine waves influenced by time to simulate plasma movement
     float color = sin(uv.x * 10.0 + u_time * 2.0) + 
                   sin(uv.y * 10.0 + u_time * 3.0) + 
                   sin((uv.x + uv.y) * 5.0 + u_time * 1.5) + 
                   sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 + u_time * 0.8);
     
     // Normalize and cycle the color value using sin
     color = sin(color * 3.14159);

     // Assign dynamic color values (RGB) with time-based cycling
     vec3 finalColor = vec3(0.5 + 0.5 * sin(color + u_time), 
                            0.5 + 0.5 * sin(color + u_time + 2.0), 
                            0.5 + 0.5 * sin(color + u_time + 4.0));

     gl_FragColor = vec4(finalColor, 1.0);
     }
`;

var moireFragmentShader = `
precision mediump float;
 varying vec2 v_uv;
 uniform float u_time;

 void main() {
     // First source at (0.3, 0.5)
     vec2 source1 = vec2(0.3, 0.5);
     float dist1 = length(v_uv - source1);
     float intensity1 = sin(100.0 * dist1 - u_time);  // Increased frequency for sharper lines

     // Second source at (0.7, 0.5)
     vec2 source2 = vec2(0.7, 0.5);
     float dist2 = length(v_uv - source2);
     float intensity2 = sin(100.0 * dist2 - u_time);  // Increased frequency for sharper lines

     // Combine the intensities from both sources
     float combinedIntensity = (intensity1 + intensity2) * 0.5;

     // Sharpen the pattern by using a step function for more defined lines
     float sharpIntensity = smoothstep(0.4, 0.6, 0.5 + 0.5 * combinedIntensity);

     // Output the sharper color based on the combined intensity
     gl_FragColor = vec4(vec3(sharpIntensity), 1.0);
 }
`;

var tunnelFragmentShader = `
 precision mediump float;
 varying vec2 v_uv;
 uniform vec2 u_resolution;
 uniform float u_time;

 void main() {
     vec2 uv = v_uv * 2.0 - 1.0;  // Normalize coordinates to [-1, 1]

     // Add zoom effect for tunnel motion
     float zoom = 5.0 + sin(u_time * 0.5) * 2.0;
     float radius = length(uv) * zoom;

     // Add twisting based on radius and time
     float twist = u_time * 0.5;
     float angle = atan(uv.y, uv.x) + twist * radius;

     // Create radial stripes for texture
     float stripes = sin(20.0 * radius);

     // Add color gradient
     vec3 color = vec3(
         0.5 + 0.5 * cos(angle * 3.0 + u_time),
         0.5 + 0.5 * sin(angle * 5.0 - u_time),
         0.5 + 0.5 * cos(radius * 2.0 - u_time)
     );

     // Animate pulsing light effect
     float lightPulse = 0.5 + 0.5 * sin(radius * 10.0 - u_time * 5.0);
     color *= lightPulse;

     // Add fog effect for depth
     float fog = smoothstep(1.5, 2.0, radius);
     color = mix(color, vec3(0.0), fog);   // Mix color with fog

     gl_FragColor = vec4(color, 1.0);
 }
`;

var metaballsFragmentShader = `
precision mediump float;
 varying vec2 v_uv;
 uniform float u_time;

 // Function to calculate the metaball effect
 float metaball(vec2 uv, vec2 center, float radius) {
     float distance = length(uv - center);
     return smoothstep(radius, 0.0, distance);  // Smooth transition for blending
 }

 void main() {
     vec2 uv = v_uv * 2.0 - 1.0;  // Normalize coordinates to [-1, 1]
     
     // Define multiple metaball centers with independent movement
     vec2 pos1 = vec2(sin(u_time * 1.3), cos(u_time * 0.9)) * 0.5;
     vec2 pos2 = vec2(cos(u_time * 1.7), sin(u_time * 1.4)) * 0.5;
     vec2 pos3 = vec2(sin(u_time * 1.9), cos(u_time * 1.5)) * 0.5;

     // Animate the radii of the metaballs
     float radius1 = 0.5 + 0.05 * sin(u_time * 2.0);
     float radius2 = 0.4 + 0.05 * cos(u_time * 3.0);
     float radius3 = 0.35 + 0.05 * sin(u_time * 4.0);

     // Compute metaball intensities and blend them together
     float intensity = metaball(uv, pos1, radius1) +
                       metaball(uv, pos2, radius2) +
                       metaball(uv, pos3, radius3);

     // Dynamic color gradient based on intensity
     vec3 color = mix(vec3(0.1, 0.6, 1.0), vec3(1.0, 0.5, 0.2), intensity);

     // Output the color with smooth blending
     gl_FragColor = vec4(color * intensity, 1.0);
 }
`;
