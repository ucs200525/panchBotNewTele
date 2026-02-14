const SuryaEngine = require('./astrology_engines/surya_siddhanta_engine');
const date = new Date();
console.log('Surya Siddhanta Engine Load Test');
try {
    const results = SuryaEngine.calculatePositions(date);
    console.log('SUCCESS: Ahargana =', results.ahargana);
    console.log('Sun True Degree =', results.sun.true);
} catch (e) {
    console.error('FAILURE:', e.message);
    console.error(e.stack);
}
