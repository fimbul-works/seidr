float mote(vec2 p, float fx, float fy, float ax, float ay, float s) {
  float t = 420.0 + iTime * 0.01;
  vec2 r = vec2(p.x + cos(t * fx) * ax, p.y + sin(t * fy) * ay);	
  return s / length(r);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 p = -1. + 2. * uv + vec2(0, .75);
  p.x	*= iResolution.x / iResolution.y;

  vec3 color1 = vec3(.4, .467, .733); // #6677bb
  vec3 color2 = vec3(.467, .267, .6); // #774499
  vec2 center = vec2(1., 0.);
  int num = 69;

  float brightness = 2.;
  float alpha = 0.;
  float a = 1.;
  float b = 3.;
  float c = .1;
  float d = .1;
  float limit = 1. / float(num) * 2.;
  float size = limit * .005;

  for (int i = 0; i < num; i++) {
  	alpha += mote(p, a, b, c, d, float(i + 1) * size);
    a += limit;
    b = tan(a * 4.);
    c += 0.1;
    d = tan(c * 4.);
  }
  alpha = clamp(alpha, 0., 1.);

  vec3 col = mix(color1, color2, 1. - uv.y) * alpha * brightness;

  fragColor = vec4(col, alpha);
}
