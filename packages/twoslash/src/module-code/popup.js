// This file is used to create the popups for the twoslash code blocks
// It uses the floating-ui library to position the popup
// It also uses the MutationObserver to update the popups when the page changes
// It also listens for the astro:page-load event to update the popups when the page is loaded
import {
	computePosition,
	size,
	shift,
} from "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.10/+esm";

/**
 * Sets up a tooltip for the given reference node. The tooltip will be displayed
 * when the user hovers over the reference node and will be positioned using the
 * Popper.js library.
 *
 * @param {HTMLElement} referenceNode - The DOM element to which the tooltip is attached.
 *
 * The tooltip will be appended to the `.main-pane` element if it exists, otherwise
 * it will be appended to the document body. The tooltip's position will be updated
 * dynamically based on the reference node's position.
 *
 * The tooltip will have a unique identifier for the `aria-describedby` attribute,
 * which is used for accessibility purposes.
 *
 * The tooltip will be shown on mouse enter and hidden on mouse leave.
 */
function setupTooltip(ToolTip, isMobileScreen) {
	const hoverAnnotation = ToolTip.querySelector(".twoslash-popup-container");
	const expressiveCodeBlock = hoverAnnotation.closest(".expressive-code");

	// Compute a unique identifier to use for the aria-describedby attribute
	const randomId = `twoslash_popup_${[Math.random(), Date.now()].map((n) => n.toString(36).substring(2, 10)).join("_")}`;

	// biome-ignore lint/complexity/useOptionalChain: <explanation>
	if (hoverAnnotation && hoverAnnotation.parentNode) {
		hoverAnnotation.parentNode.removeChild(hoverAnnotation);
	}

	function updatePosition() {
		expressiveCodeBlock.appendChild(hoverAnnotation);

		new Promise((resolve) =>
			requestAnimationFrame(() => {
				requestAnimationFrame(resolve);
			}),
		)
			.then(() =>
				computePosition(ToolTip, hoverAnnotation, {
					placement: isMobileScreen ? "bottom" : "bottom-start",
					middleware: [
						size({
							apply({ availableWidth }) {
								Object.assign(hoverAnnotation.style, {
									maxWidth: `${Math.max(0, isMobileScreen ? 300 : availableWidth)}px`,
									maxHeight: "100%",
								});
							},
						}),
						shift(),
					],
				}),
			)
			.then(({ x, y }) => {
				Object.assign(hoverAnnotation.style, {
					display: "block",
					left: `${isMobileScreen ? 50 : x}px`,
					top: `${y}px`,
				});
			});
	}

	let isMouseOverTooltip = false;
	let hideTimeout;

	const TimeoutDelay = 100; // ms

	ToolTip.addEventListener("mouseenter", () => {
		clearTimeout(hideTimeout); // Clear any previous hide timeouts
		updatePosition();
		hoverAnnotation.setAttribute("aria-hidden", "false");
		ToolTip.querySelector(".twoslash-hover span")?.setAttribute(
			"aria-describedby",
			randomId,
		);
		hoverAnnotation.setAttribute("id", randomId);
	});

	ToolTip.addEventListener("mouseleave", () => {
		// Set a timeout to hide the tooltip after a short delay
		hideTimeout = setTimeout(() => {
			if (!isMouseOverTooltip) {
				hideTooltip();
			}
		}, TimeoutDelay);
	});

	hoverAnnotation.addEventListener("mouseenter", () => {
		clearTimeout(hideTimeout); // Clear the hide timeout if hovering over the tooltip
		isMouseOverTooltip = true;
	});

	hoverAnnotation.addEventListener("mouseleave", () => {
		isMouseOverTooltip = false;
		// Set a timeout to hide the tooltip if not over the reference node
		hideTimeout = setTimeout(() => {
			if (!ToolTip.matches(":hover")) {
				hideTooltip();
			}
		}, TimeoutDelay);
	});

	function hideTooltip() {
		hoverAnnotation.setAttribute("aria-hidden", "true");
		ToolTip.querySelector(".twoslash-hover span")?.removeAttribute(
			"aria-describedby",
		);
		hoverAnnotation.removeAttribute("id");
		expressiveCodeBlock.removeChild(hoverAnnotation);
	}
}

const isMobileScreen = window.matchMedia("(max-width: 768px)").matches;

/**
 * Initializes tooltips for elements with the class "twoslash" within the specified container.
 *
 * @param {HTMLElement} container - The container element in which to search for elements with the class "twoslash".
 */
function initTwoslashPopups(container) {
	// biome-ignore lint/complexity/noForEach: <explanation>
	container.querySelectorAll?.(".twoslash-hover").forEach((el) => {
		setupTooltip(el, isMobileScreen);
	});
}

initTwoslashPopups(document);

/**
 * Creates a new MutationObserver to observe changes in the DOM and initialize twoslash popups for newly added nodes.
 *
 * @constant {MutationObserver} newTwoslashPopupObserver - The MutationObserver instance that watches for added nodes.
 * @param {MutationRecord[]} mutations - Array of mutation records.
 * @param {MutationRecord} mutations[].addedNodes - List of nodes that were added.
 */
const newTwoslashPopupObserver = new MutationObserver((mutations) =>
	// biome-ignore lint/complexity/noForEach: <explanation>
	mutations.forEach((mutation) =>
		// biome-ignore lint/complexity/noForEach: <explanation>
		mutation.addedNodes.forEach((node) => {
			initTwoslashPopups(node);
		}),
	),
);

newTwoslashPopupObserver.observe(document.body, {
	childList: true,
	subtree: true,
});

document.addEventListener("astro:page-load", () => {
	initTwoslashPopups(document);
});
