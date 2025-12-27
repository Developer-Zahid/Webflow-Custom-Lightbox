/**
 * Webflow Custom Lightbox Script
 * * This script scans for elements with the 'data-lightbox-src' attribute, generates the required Webflow JSON structure and re-initializes the Webflow Lightbox module.
 * * Usage:
 * Add attribute `data-lightbox-src="URL"` (Video or Image link)
 * Optional attributes:
 * - `data-lightbox-type="video"` or `"image"` (Forces specific media type)
 * - `data-lightbox-group="my-gallery"`
 * - `data-lightbox-caption="My Caption"`
 * - `data-lightbox-width="940"`
 * - `data-lightbox-height="528"`
 * - `data-lightbox-thumbnail="URL"` (Custom thumbnail, required for videos in groups)
 */
window.Webflow ||= [];
window.Webflow.push(function () {
  (function () {
    // 1. Helper function to determine media type and structure
    function parseMedia(url, caption, customWidth, customHeight, customType, customThumbnail, group) {
      // Enforce that both URL and Type are provided
      if (!url || !customType) return null;

      // Default dimensions if not provided (Standard 16:9 for videos, or arbitrary for images)
      const defaultWidth = 940;
      const defaultHeight = 528;

      let width = parseInt(customWidth) || defaultWidth;
      let height = parseInt(customHeight) || defaultHeight;

      // Normalize type input (Image/image -> image)
      const normalizeType = customType.toLowerCase();

      // If explicitly set to image, return image object
      if (normalizeType === "image") {
        return {
          type: "image",
          url: url,
          width: width,
          height: height,
          ...(caption ? { caption: caption || "" } : {}),
        };
      } else {
        // Treat as video (User must provide embed-friendly URL)
        return {
          type: "video",
          url: url,
          width: width,
          height: height,
          originalUrl: url,
          html: `<iframe src="${url}" width="${width}" height="${height}" scrolling="no" frameborder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture;" allowfullscreen="true"></iframe>`,
          ...(group ? { thumbnailUrl: customThumbnail || "" } : {}),
        };
      }
    }

    // 2. Main execution function
    function initDynamicLightbox() {
      const triggers = document.querySelectorAll("[data-lightbox-src]");

      triggers.forEach((trigger) => {
        const type = trigger.getAttribute("data-lightbox-type");
        const src = trigger.getAttribute("data-lightbox-src");
        const group = trigger.getAttribute("data-lightbox-group") || "";
        const caption = trigger.getAttribute("data-lightbox-caption") || "";
        const width = trigger.getAttribute("data-lightbox-width");
        const height = trigger.getAttribute("data-lightbox-height");
        const thumbnail = trigger.getAttribute("data-lightbox-thumbnail");

        const mediaData = parseMedia(src, caption, width, height, type, thumbnail, group);

        // Construct config regardless of whether mediaData is valid
        // If mediaData is null (e.g. missing type), items will be empty array []
        const lightboxConfig = {
          items: mediaData ? [mediaData] : [],
          group: group,
        };

        let script = trigger.querySelector("script.w-json");
        if (!script) {
          script = document.createElement("script");
          script.type = "application/json";
          script.className = "w-json";
          trigger.appendChild(script);
        }

        script.textContent = JSON.stringify(lightboxConfig);
      });

      // 3. Re-initialize Webflow's Lightbox Module
      if (window.Webflow && window.Webflow.require("lightbox")) {
        window.Webflow.require("lightbox").ready();
      }
    }

    // 4. Run when DOM is ready
    initDynamicLightbox();
  })();
});
