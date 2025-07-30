#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_texCoord;
uniform sampler2D u_texture;
uniform float u_blurRadius;
uniform float u_texelWidthOffset;

void main()
{
    vec4 sum = vec4(0.0);
    float totalWeight = 0.0;
    float blurAmount = 1.0 / (u_blurRadius * 2.0 + 1.0);
    
    for (float i = -u_blurRadius; i <= u_blurRadius; i++)
    {
        float weight = exp(-i * i / (2.0 * u_blurRadius * u_blurRadius));
        sum += texture2D(CC_Texture0, v_texCoord + vec2(i * u_texelWidthOffset, 0.0)) * weight;
        totalWeight += weight;
    }
    
    sum /= totalWeight;  // Normalize the sum to ensure correct brightness
    gl_FragColor = sum;
}
