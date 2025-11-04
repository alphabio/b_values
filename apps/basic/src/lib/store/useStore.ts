// b_path:: apps/basic/src/lib/store/useStore.ts
// src/store/useStore.ts
import { Howl } from "howler";
import { create } from "zustand";

// Define the state's shape
interface AppState {
  hasClicked: boolean;
  logoFadeOut: boolean; // Controls logo fade out
  startScene2: boolean; // Controls when Scene 2 transition begins
  actions: {
    click: () => void;
  };
}

// Initialize the sound outside the store
const transitionSound = new Howl({
  src: ["/sounds/theme_1.mp3"],
  volume: 0.0, // Start at 0 for fade in
});

export const useStore = create<AppState>((set, get) => ({
  hasClicked: false,
  logoFadeOut: false,
  startScene2: false,
  actions: {
    click: () => {
      // Only trigger on the first click
      if (!get().hasClicked) {
        // Step 1: Start logo fade out immediately
        set({ hasClicked: true, logoFadeOut: true });

        // Step 2: Start music with fade in
        transitionSound.play();
        transitionSound.fade(0.0, 0.5, 1000); // Fade from 0 to 0.5 over 1 second

        // Step 3: Start Scene 2 transition 1 second after music starts
        setTimeout(() => {
          set({ startScene2: true });
        }, 1000);
      }
    },
  },
}));
