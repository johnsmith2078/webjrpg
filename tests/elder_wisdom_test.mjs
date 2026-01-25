// Test script for elder_wisdom quest fix
import { createGame } from '../modules/game.js';
import { createInitialState } from '../modules/state.js';

function resolvePromptIfAny(game) {
  const s = game.getState();
  if (!s.prompt) return;
  const choices = Array.isArray(s.prompt.choices) ? s.prompt.choices : [];
  const firstEnabled = choices.find((c) => c && !c.disabled);
  if (firstEnabled) {
    game.handleChoice(`prompt:${firstEnabled.id}`);
  } else {
    game.handleChoice("prompt:close");
  }
}

function runTest() {
  console.log('=== Testing Elder Wisdom Quest Fix ===\n');
  
  // Create a new game with a fixed seed
  const seed = 123;
  const initialState = createInitialState(seed);
  
  // Manually set up quest prerequisites and unlock the mine
  initialState.flags = {
    has_firepit: true,
    met_elder: true
  };
  initialState.quests = {
    elder_wisdom: {
      started: true,
      progress: {}
    }
  };
  // Satisfy the second objective so we can verify completion.
  initialState.inventory.shrine_relic = 1;
  // Unlock abandoned_mine by setting time and discovered
  initialState.timeMin = 100;
  initialState.discovered.abandoned_mine = true;
  initialState.unlocked.abandoned_mine = true;
  // Set location directly to abandoned_mine to simulate travel
  initialState.location = 'abandoned_mine';
  
  const game = createGame({ state: initialState });
  let state = game.getState();
  
  console.log('1. Initial state:');
  console.log('   Location:', state.location);
  console.log('   Quest started:', state.quests?.elder_wisdom?.started);
  console.log('   Quest completed:', state.quests?.elder_wisdom?.completed);
  console.log('');
  
  // Explore until the objective completes.
  console.log('2. Exploring in abandoned_mine until objective completes...');
  for (let i = 1; i <= 20; i++) {
    console.log(`   Step ${i}:`);
    game.handleChoice('explore');
    resolvePromptIfAny(game);

    state = game.getState();
    const progress = state.quests?.elder_wisdom?.progress;
    const exploreProgress = progress ? progress.elder_wisdom_explore_abandoned_mine : null;
    if (exploreProgress) {
      console.log(
        `     Progress: ${exploreProgress.current}/${exploreProgress.target}, Complete: ${exploreProgress.complete}`
      );
      if (exploreProgress.complete) break;
    } else {
      console.log('     Progress: (not tracked yet)');
    }
  }
  
  state = game.getState();
  console.log('\n3. Final quest state:');
  console.log('   Quest completed:', state.quests?.elder_wisdom?.completed);
  
  // Check if the fix worked
  if (state.quests?.elder_wisdom?.completed && state.flags?.quest_elder_complete) {
    console.log('\n✅ SUCCESS: Elder wisdom quest completes after mine exploration + relic!');
  } else {
    console.log('\n❌ FAIL: Quest still not completing');
  }
  
  // Verify the log has the completion message
  const logMessages = state.log.map(l => l.text);
  const completionLog = logMessages.find(t => t.includes('任务完成'));
  if (completionLog) {
    console.log('   Log message:', completionLog);
  }
}

runTest();
