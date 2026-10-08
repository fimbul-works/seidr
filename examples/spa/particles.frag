float ball(vec2 p, float fx, float fy, float ax, float ay, float s) {
  float t = 420.0 + iTime * 0.01;
  vec2 r = vec2(p.x + cos(t * fx) * ax, p.y + sin(t * fy) * ay);	
  return s / length(r);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 p = -1.0 + 2.0 * uv + vec2(0, 0.75);
  p.x	*= iResolution.x / iResolution.y;

  vec3 color1 = vec3(0.400, 0.467, 0.733); // #6677bb
  vec3 color2 = vec3(0.467, 0.267, 0.600); // #774499
  vec2 center = vec2(1.0, 0.0);
  float dist = length(uv - center);
  dist *= dist;
  int num = 69;

  float brightness = 2.0;
  float alpha = 0.0;
  float a = 1.0;
  float b = 3.0;
  float c = 0.1;
  float d = 0.1;
  float limit = 1.0 / float(num) * 2.0;
  float size = limit * 0.005;

  for (int i = 0; i < num; i++) {
  	alpha += ball(p, a, b, c, d, float(i + 1) * size);
    a += limit;
    b = tan(a * 4.);
    c += 0.1;
    d = tan(c * 4.);
  }
  alpha = clamp(alpha, 0.0, 1.0);

  vec3 col = mix(color1, color2, 1.0 - uv.y) * alpha * brightness;

  fragColor = vec4(col, alpha);
}

