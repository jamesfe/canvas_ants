let config = {
  guns: {
    gunRange: 25,
    numGuns: 150,
    bulletDamage: 101,
    firingRate: 2
  },
  world: {
    factor: 6,
    runs: 5000,
    timePerRun: 60,
    initialTargets: 5,    // how many targets do we start with
    initialAnts: 1,
    width: 900,
    height: 900,
    spawnCycle: 50,       // How often do ants spawn
    restCycle: 1500       // How often do we not spawn ants (these cycles %)
  },
  ant: {
    startingHealth: 100
  },
  prices: {
    gun: 25,
    permWall: 100,
    wall: 5
  },
  budget: {
    antBudgetRate: 0.0,
    startingBudget: 10000.0
  }
};


export default config;
