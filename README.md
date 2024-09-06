# Case Study: Akaru 2019 | Codrops
![AkaruCaseStudy_featured](https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2019/12/AkaruCaseStudy_featured.jpg?x80028)

In 2019, a new version of our [Akaru studio website](https://www.akaru.fr/) has been released.

After long discussions between developers and designers, we found the creative path we wanted to take for the redesign. The idea was to create a connection between our name Akaru and the graphic style. Meaning “to highlight” in Japanese, we wanted Akaru to transmit the light spectrum, the iridescence and reflections that light can have on some surfaces. 

The particularity of the site is the mixing of regular content in the DOM/CSS and interactive background content in WebGL. We’ll have a look at how we planned and decided on the visuals of the main effect, and in the second part will share a technical overview and show how the “iridescent oil” effect was coded.

Design of the liquid effect
---------------------------

In the following, we will go through our iteration process between design and implementation and how we decided on the visuals of the interactive liquid/oil effect.

### Visual Search

After some in-depth research, we built an inspirational mood board inspired by 3D artists and photographers. We have therefore selected several colors, and used all the details present in the images of liquids we considered: the mixture of fluids, streaks of colors and lights.

![](https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2019/12/image3.jpg?x80028)

### Processus

We started to create our first texture tests in Photoshop using vector shapes, brushes, distortions, and blurs. After several tests we were able to make our first environmental test with an interesting graphic rendering. The best method was to first draw the waves and shapes, then paint over and mix the colors with the different fusion modes.

![](https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2019/12/image1.jpg?x80028)

### Challenges

The main challenge was to “feel” a liquid effect on the textures. It was from this moment that the exchange between designers and developers became essential. To achieve this effect, the developers created a parametric tool where the designers could upload a texture, and then decide on the fluid movements using a Flowmap. From there, we could manage amplitudes, noise speed, scale and a multitude of options.

![](https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2019/12/image2.jpg?x80028)

Implementing the iridescent oil effect
--------------------------------------

Now we will go through the technical details of how the iridescent oil effect was implemented on every page. We are assuming some basic knowledge of WebGL with Three.js and the GLSL language so we will skip over commonly used code, like scene initialization.

### Creating the plane

For this project, we use the [OrthographicCamera](https://threejs.org/docs/#api/en/cameras/OrthographicCamera) of Three.js. This camera removes all perspective so we can create our plane without caring about the depth of it.

We will create our plane with a geometry which has the width of the viewport, and we get the height by multiplying the width of the plane by the aspect ratio of our texture:

```
const PLANE_ASPECT_RATIO = 9 / 16;

const planeWidth = window.innerWidth;
const planeHeight = planeWidth * PLANE_ASPECT_RATIO;

const geometry = new PlaneBufferGeometry(planeWidth, planeHeight);
```


We could keep the number of segments by default since this effect runs on the fragment shader. By doing so, we reduce the amount of vertices we have to render, which is always good for performance.

Then, in the shader we use the UVs to sample our texture:

```
vec3 color = texture2D(uTexture, vUv).rgb;

gl_FragColor = vec4(color, 1.0);
```


### Oil motion

Now that our texture is rendered on our plane, we need to make it flow.

To create some movement, we sampled the texture with an offset **two times** with a different **offset**:

```
float phase1 = fract(uTime * uFlowSpeed + 0.5);
float phase2 = fract(uTime * uFlowSpeed + 1.0);

// mirroring phase
phase1 = 1.0 - phase1;
phase2 = 1.0 - phase2;

vec3 color1 = texture2D(
    uTexture,
    uv + vec2(0.5, 0.0) * phase1).rgb;

vec3 color2 = texture2D(
    uTexture,
    uv + vec2(0.5, 0.0) * phase2).rgb;
```


Then we blend our two textures together:

```
float flowLerp = abs((0.5 - phase1) / 0.5);
vec3 finalColor = mix(color1, color2, flowLerp);

return finalColor;
```


But we don’t want our texture to always flow in the same direction, we want some areas to flow up, some others to flow to the right, and so on. To achieve this, we used **Flow Map** or **Vector Map**, which look like this:

#### Example Flow Map

A flow map is a texture in which every pixel contains a direction represented as a 2d vector **x** and **y**. In this texture, the **red** component stores the direction on the **x** axis, while the **green** component stores the direction on the **y** axis. Areas where the liquid is stationary are **mid red** and **mid green** (you can find those areas on top of the map). In fact, the direction could be in two ways, for example on the **x** axis the liquid could go to the left or to the right. To store this information a red value of **0** will make the texture go **to the left** and a red value of **255** will make the texture **go to the right**. In the shader, we implement this logic like this:

```
vec2 flowDir = texture2D(uFlowMap, uv).rg;
// make mid red and mid green the "stationary flow" values
flowDir -= 0.5;

// mirroring phase
phase1 = 1.0 - phase1;
phase2 = 1.0 - phase2;

vec3 color1 = texture2D(
    uTexture,
    uv + flowDir * phase1).rgb;

vec3 color2 = texture2D(
    uTexture,
    uv + flowDir * phase2).rgb;
```


We painted this map using **Photoshop** and unfortunately, with all exports (jpeg, png, etc.), we always got some weird artefacts. We found out that using **PNG** resulted in the least “glitchy” exports we could obtain. We guess that it comes from the **compression** algorithm for exports in Photoshop. These artefacts are invisible to the eye and can only be seen when we use it as a **map**. To fix that, we blurred the texture two times with **glsl-fast-gaussian-blur** (one vertically and one horizontally) and blended them together:

```
vec4 horizontalBlur = blur(
    uFlowMap,
    uv,
    uResolution,
    vec2(uFlowMapBlurRadius, 0.0)
  );
vec4 verticalBlur = blur(
    uFlowMap,
    uv,
    uResolution,
    vec2(0.0, uFlowMapBlurRadius)
  );
vec4 texture = mix(horizontalBlur, verticalBlur, 0.5);
```


As you can see, we used **glslify** to import glsl modules hosted on **npm**; it’s very useful to keep you shader’s code split and as simple as possible.

### Make it feel more natural

Now that our liquid flows, we can clearly see when the liquid is repeating. But liquid doesn’t flow this way in real life. To create a better illusion of a realistic flow movement, we added some turbulence to distort our textures. 

To create this turbulence we use **glsl-noise** to compute a **3D Noise** in which **x** and **y** will be the **UV** downscaled a bit to create a large distortion, and **Z** will be the time elapsed since the first frame, this will create an animated seamless noise:

```
float x = uv.x * uNoiseScaleX;
float y = uv.y * uNoiseScaleY;

float n = cnoise3(vec3(x, y, uTime * uNoiseSpeed));
```


Then, instead of sampling our flow with the default UV, we distort them with the noise:

```
vec2 distordedUv = uv + applyNoise(uv);

vec3 color1 = texture2D(
    uTexture,
    distordedUv + flowDir * phase1).rgb;

...
```


On top of that, we use a uniform called **uNoiseAmplitude** to control the noise strength.

To observe how the noise influences the rendering, you can tweak it inside the “**Noise**” folder in the **GUI** at the top right of the screen. For example, try to tweak the “**amplitude**” value:

### Adding the mouse trail

To add some user interaction, we wanted to create a trail inside the oil, like a finger pushing the oil, where the finger would be the user’s pointer. This effect consists of three things:

#### 1\. Computing the mouse trail

To achieve this we used a **Frame Buffer** (or FBO). I will not go very deep into what frame buffers are here but if you want to you can learn everything about it [here](https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html). 

Basically, it will: 

1.  Draw a circle in the current mouse position
2.  Render this as a texture
3.  Store this texture
4.  Use this texture the next frame to draw on top of it the new mouse position
5.  Repeat

By doing so, we have a trail drawn by the mouse and **everything run on the GPU**! For this kind of simulations, running them on the GPU is way more performant than running them on the CPU.

#### 2\. Blending the trail with the flow map

We can use the frame buffer as texture. It will be a black texture, with a white trail painted by the mouse. So we pass our trail texture via **uniform** to our **Oil** shader and we can compute it like this:

```
float trail = texture2D(uTrailTexture, uv).r;
```


We use only the **red** component of our texture since it’s a grayscale map and all colors are equal.

Then inside our **flow** function we use our trail to **change** the direction our liquid texture flow:

```
flowDir.x -= trail;
flowDir.y += trail * 0.075;
```


#### 3\. Adding the mouse acceleration

When we move our finger in a liquid, the trail it will create depends on the speed our finger moves. To recreate this feeling we make the **radius** of the trail depending on the mouse speed: the **faster** the mouse will go, the **bigger** the trail will be.

To find the mouse speed we compute the difference between the damped and the current mouse position:

```
const deltaMouse = clamp(this.mouse.distanceTo(this.smoothedMouse), 0.0, 1.0) * 100;
```


Then we normalize it and apply an easing to this value with the easing functions provided by **TweenMax** to avoid creating a linear acceleration.

```
const normDeltaMouse = norm(deltaMouse, 0.0, this.maxRadius);
const easeDeltaMouse = Circ.easeOut.getRatio(normDeltaMouse);
```


The Tech Stack
--------------

Here’s an overview of the technologies we’ve used in our project:

*   **[three.js](https://threejs.org/)** for the WebGL part
*   **[Vue.js](https://vuejs.org/)** for the DOM part, it allows us to wrap up the WebGL inside a component which communicate easily with the rest of the UI 
*   **[GSAP](https://greensock.com/gsap/)** is the tweening library we love and use in almost every project as it is well optimized and performant
*   **[Nuxt.js](https://nuxtjs.org/)** to pre-render during deployment and serve all our pages as static files

**[Prismic](https://prismic.io/)** is a really easy to use headless CMS with a nice API for image formatting and a lot of others useful features.

Conclusion
----------

We hope you liked this Case Study, if you have any questions, feel free to ask us on Twitter ([@lazyheart](https://twitter.com/lazyheart) and [@colinpeyrat](https://twitter.com/ColinPeyrat)), we would be very happy to receive your feedback!