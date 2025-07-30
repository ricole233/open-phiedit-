#ifdef GL_ES
precision mediump float;
#endif
varying vec4 v_fragmentColor;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
uniform float blurRadius;
uniform vec2 resolution;

void main()
{
    vec2 tex_offset = vec2(1.0) / resolution; // gets size of single texel
    vec4 color = vec4(0.0);
    float total = 0.0;

    for (float x = -blurRadius; x <= blurRadius; x++)
    {
        for (float y = -blurRadius; y <= blurRadius; y++)
        {
            float weight = exp(-(x*x + y*y) / (2.0 * blurRadius * blurRadius));
            vec4 sample = texture2D(CC_Texture0, v_texCoord + vec2(x, y) * tex_offset);
            color += sample * weight;
            total += weight;
        }
    }
    gl_FragColor = color / total;
}
