# Agent Notes

This file contains meta-instructions and context for AI agents working on the Quierka codebase.

## Core Directives
1. **No unnecessary abstractions**: Do not over-engineer the codebase. If a simple array loop suffices, use it. Do not introduce complex class hierarchies for the core math.
2. **Strict separation of concerns**: Keep `/core` absolutely free of React/DOM or browser-specific references. It must remain pure TS/JS.
3. **No extra dependencies**: If a matrix math operation is simple (e.g., dot product, Euclidean distance), write it out. Do not pull in heavy math libraries unless explicitly approved.
4. **Formatting**: Ensure you are updating `task.md` and using the right markdown conventions when modifying code.
5. **GPU Future**: The goal is to eventually offload the `computeKernelMatrix` logic to an external GPU worker or a Python backend. Design your additions keeping in mind that the computation layer will one day run entirely off-device.
