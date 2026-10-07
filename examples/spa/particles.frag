float noise(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = fragCoord.xy / iResolution.xy;
    
  float u_brightness = 0.8;
  float u_blobiness = 0.8;
  float u_particles = 240.0;
  float u_limit = 100.0;
  float u_energy = 0.1;

  vec2 position = (fragCoord.xy / iResolution.xy);
  float t = iTime * u_energy;
    
  float a = 0.0;
  float b = 0.0;
  float c = 0.0;

  vec2 pos;
  vec2 center = vec2(0.5, 0.5 * (iResolution.y / iResolution.x));

  float na, nb, nc, nd, d;
  float limit = u_particles / u_limit;
  float step = 1.0 / u_particles;
  float n = 0.0;

  for (float i = 0.0; i <= 1.0; i += 0.025) {
    if (i <= limit) {
      vec2 np = vec2(n, 0);
        
      na = noise(np * 1.1);
      nb = noise(np * 2.8);
      nc = noise(np * 0.7);
      nd = noise(np * 3.2);

      pos = center;
      pos.x += sin(t * na) * cos(t * nb) * tan(t * na * 0.15) * 0.3;
      pos.y += tan(t * nc) * sin(t * nd) * 0.1;
        
      d = pow(1.6 * na / length(pos - position), u_blobiness);
        
      if (i < limit * 0.3333) a += d;
      else if (i < limit * 0.5) b += d;
      else c += d;

      n += step;
    }
  }

  vec3 col = vec3(a * 25.5, 0.0, a * b) * 0.0001 * u_brightness;
  fragColor = vec4(col, 1.0);
}
