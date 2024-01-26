import InstructionsPlugin from "@jspsych/plugin-instructions";
export function createInstructions(pages, allowBackward, clickableNavigation) {
  const instructions = {
    type: InstructionsPlugin,
    pages: pages,
    allowBackward: allowBackward,
    show_clickable_nav: clickableNavigation,
  };

  return instructions;
}
