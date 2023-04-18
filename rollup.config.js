export default {
    input: 'index',
    output: {
      file: 'dist/BrAPITraitSelector.js',
      format: 'umd',
      name: 'BrAPITraitSelector',
      globals: {
        '@solgenomics/brapijs':'BrAPI',
      }
    }
  };
