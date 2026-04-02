const takeSnapshots: boolean = Cypress.expose('takeSnapshots') || false;

// For ARIA-based checks
const BE_SELECTED = ['have.attr', 'aria-selected', 'true'] as const;

describe('/mock', () => {
  beforeEach(() => {
    cy.visit('/mock');
    cy.waitForStableDOM();
  });

  it('search items in the file', () => {
    cy.findByRole('tab', { name: 'Search' }).click();

    cy.findByRole('textbox', { name: 'Path to search' }).type('scatter');

    cy.findAllByRole('treeitem')
      .should('have.length', 3)
      .each((e) => expect(e).to.contain('scatter'));

    cy.findByRole('treeitem', { name: '/nexus/scatter' }).click();
    cy.waitForStableDOM();

    cy.findByRole('figure', { name: 'scatter_data' }).should('be.visible');

    // Check that the selected node is kept when tabbing in Explorer
    cy.findByRole('tab', { name: 'Explorer' }).click();
    cy.findExplorerNode('scatter').should('have.attr', 'aria-selected', 'true');
    // And has focus
    cy.findExplorerNode('scatter').should('have.focus');

    // Check that the search value is kept when tabbing back from Explorer
    cy.findByRole('tab', { name: 'Search' }).click();
    cy.findByRole('textbox', { name: 'Path to search' }).should(
      'have.value',
      'scatter',
    );
  });

  context('NeXus', () => {
    it('visualize default NXdata group as NxHeatmap', () => {
      cy.selectExplorerNode('source.h5');

      cy.findByRole('tab', { name: 'NX Heatmap' }).should(...BE_SELECTED);
      cy.findByRole('heading', { name: 'source.h5' }).should('be.visible');
      cy.findByRole('figure', { name: 'NeXus 2D' }).should('be.visible');
    });

    it('visualize dataset with "spectrum" interpretation as NxLine', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('spectrum');

      cy.findByRole('tab', { name: 'NX Line' }).should(...BE_SELECTED);
      cy.findByRole('heading', { name: 'nexus / spectrum' }).should(
        'be.visible',
      );
      cy.findByRole('figure', { name: 'twoD (arb. units)' }).should(
        'be.visible',
      );

      cy.get('svg[data-type="abscissa"] svg').should('have.text', 'X (nm)');

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxline');
      }
    });

    it('visualize dataset with "image" interpretation as NxHeatmap', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('image');

      cy.findByRole('tab', { name: 'NX Heatmap' }).should(...BE_SELECTED);
      cy.findByRole('heading', { name: 'nexus / image' }).should('be.visible');
      cy.findByRole('figure', { name: 'Interference fringes' }).should(
        'be.visible',
      );

      cy.get('svg[data-type="ordinate"] svg').should(
        'have.text',
        'Angle (degrees)',
      );

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxheatmap');
      }
    });

    it('use axis values to compute axis ticks', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('image');

      cy.get('svg[data-type="abscissa"] .visx-axis-tick').should(
        'have.text',
        ['−20', '−10', '0', '10', '20'].join(''), // minus sign − (U+2212), not hyphen - (U+002D)
      );
    });

    it('visualize dataset with default slice', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('default_slice');

      cy.findByRole('tab', { name: 'NX Heatmap' }).should(...BE_SELECTED);
      cy.findByRole('heading', { name: 'nexus / default_slice' }).should(
        'be.visible',
      );

      cy.findAllByRole('slider', { name: /D\d/u }).should('have.length', 2);
      cy.findByRole('slider', { name: 'D0' }).should(
        'have.attr',
        'aria-valuenow',
        1,
      );
      cy.findByRole('slider', { name: 'D2' }).should(
        'have.attr',
        'aria-valuenow',
        2,
      );

      if (takeSnapshots) {
        cy.matchImageSnapshot('default_slice');
      }
    });

    it('visualize dataset with log scales on both axes on NxLine with SILX_style', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('spectrum_log');

      cy.findByRole('tab', { name: 'NX Line' }).should(...BE_SELECTED);
      cy.findByRole('heading', { name: 'nexus / spectrum_log' }).should(
        'be.visible',
      );

      cy.findAllByRole('combobox', { name: /Log/u }).should('have.length', 2);

      if (takeSnapshots) {
        cy.waitForStableDOM();
        cy.matchImageSnapshot('nxline_log');
      }
    });

    it('visualize signal and auxiliary signals datasets as NxLine', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('spectrum_with_aux');

      cy.findByRole('heading', {
        name: 'nexus / spectrum_with_aux',
      }).should('be.visible');

      if (takeSnapshots) {
        cy.matchImageSnapshot('auxspectrum');
      }
    });

    it('visualize auxiliary signal datasets as NxHeatmap', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('image_with_aux');

      cy.findByRole('heading', {
        name: 'nexus / image_with_aux',
      }).should('be.visible');
      cy.findByRole('figure', { name: 'twoD' }).should('be.visible');

      cy.findByRole('button', { name: 'Signals' }).click();
      cy.findByRole('radio', { name: 'tertiary' }).click();

      cy.findByRole('figure', { name: 'tertiary' })
        .should('be.visible')
        .and('contain.text', '−4.75e+1'); // color bar min

      if (takeSnapshots) {
        cy.matchImageSnapshot('auximage');
      }
    });

    it('visualize 2D complex signal with "spectrum" interpretation and auxiliaries as NxLine', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('spectrum_complex');

      cy.findByRole('heading', {
        name: 'nexus / spectrum_complex',
      }).should('be.visible');

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxline_complex_2d_aux');
      }
    });

    it('visualize 2D complex signal as NxHeatmap', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('image_complex');

      cy.findByRole('heading', {
        name: 'nexus / image_complex',
      }).should('be.visible');

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxheatmap_complex_2d');
      }

      // Select float auxiliary signal
      cy.findByRole('button', { name: 'Signals' }).click();
      cy.findByRole('radio', { name: 'tertiary_float' }).click();

      cy.findByRole('figure', { name: 'tertiary_float' }).should('be.visible');
      cy.waitForStableDOM();

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxheatmap_complex_2d_float_aux');
      }
    });

    it('visualize signals with "rgb-image" and "rgba-image" interpretations as NxRGB', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('rgb-image');

      cy.findByRole('tab', { name: 'NX RGB' }).should(...BE_SELECTED);
      cy.findByRole('figure', { name: 'RGB' }).should('be.visible');
      cy.findByRole('heading', { name: 'nexus / rgb-image' }).should(
        'be.visible',
      );
      cy.waitForStableDOM();

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxrgb');
      }

      cy.selectExplorerNode('rgba-image');
      cy.findByRole('tab', { name: 'NX RGB' }).should(...BE_SELECTED);
      cy.findByRole('figure', { name: 'RGBA' }).should('be.visible');
      cy.findByRole('heading', { name: 'nexus / rgba-image' }).should(
        'be.visible',
      );
      cy.waitForStableDOM();

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxrgba');
      }
    });

    it('visualize dataset with 1D signal and two 1D axes of same length as NxScatter', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('scatter');

      cy.findByRole('tab', { name: 'NX Scatter' }).should(...BE_SELECTED);
      cy.findByRole('figure', { name: 'scatter_data' }).should('be.visible');
      cy.findByRole('heading', { name: 'nexus / scatter' }).should(
        'be.visible',
      );

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxscatter');
      }
    });
  });
});
