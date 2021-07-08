const SNAPSHOT_DELAY = 500;

describe('App', () => {
  beforeEach(() => {
    cy.visit('/mock');
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('visualize 1D dataset as Line', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'oneD' }).click();

    cy.findByRole('heading', { name: 'nD_datasets / oneD' }).should('exist');
    cy.findByRole('tab', { name: 'Line' }).should('exist');
    cy.findByRole('figure', { name: 'oneD' }).should('exist');

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('line_1D');
    }
  });

  it('visualize 1D complex dataset as Line', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'oneD_cplx' }).click();

    cy.findByRole('heading', { name: 'nD_datasets / oneD_cplx' }).should(
      'exist'
    );
    cy.findByRole('tab', { name: 'Line' }).should('exist');
    cy.findByRole('figure', { name: 'oneD_cplx' }).should('exist');

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('line_complex_1D');
    }
  });

  it('visualize 1D dataset as Matrix', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'oneD' }).click();
    cy.findByRole('tab', { name: 'Matrix' }).click();

    cy.findByRole('table').should('exist');
    cy.findAllByRole('cell')
      .first()
      .should('have.attr', 'aria-rowindex', 1)
      .and('have.attr', 'aria-colindex', 1);
  });

  it('visualize 2D dataset as Heatmap', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'twoD' }).click();

    cy.findByRole('heading', { name: 'nD_datasets / twoD' }).should('exist');
    cy.findByRole('tab', { name: 'Heatmap' }).should('exist');
    cy.findByRole('figure', { name: 'twoD' }).should('exist');

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('heatmap_2D');
    }

    cy.findByRole('button', { name: 'More controls' }).click();
    cy.findByRole('button', { name: 'Invert' }).click();

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('heatmap_2D_inverted_cmap');
    }
  });

  it('visualize 2D complex dataset as Heatmap', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'twoD_cplx' }).click();

    cy.findByRole('heading', { name: 'nD_datasets / twoD_cplx' }).should(
      'exist'
    );
    cy.findByRole('tab', { name: 'Heatmap' }).should('exist');
    cy.findByRole('figure', { name: /twoD_cplx/ }).should('exist');

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('heatmap_2D_complex');
    }
  });

  it('map dimensions of 4D dataset when visualized as Heatmap', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'fourD' }).click();

    cy.findByTitle('Number of elements in each dimension')
      .parent()
      .parent()
      .should('have.text', 'n 3 9 20 41');

    cy.findByRole('radiogroup', { name: /x axis/ }).as('xRadioGroup');
    cy.findByRole('radiogroup', { name: /y axis/ }).as('yRadioGroup');
    cy.get('svg[data-type="abscissa"]').as('xAxis');
    cy.get('svg[data-type="ordinate"]').as('yAxis');

    // Check default dimension mapping
    cy.get('@xRadioGroup').within(() => {
      cy.findByRole('radio', { name: 'D3' }).should(
        'have.attr', // 'be.checked' relies on CSS selector `:checked`, which ignores `aria-checked`
        'aria-checked',
        'true'
      );
    });
    cy.get('@yRadioGroup').within(() => {
      cy.findByRole('radio', { name: 'D2' }).should(
        'have.attr',
        'aria-checked',
        'true'
      );
    });

    // Check axes ticks
    cy.get('@xAxis').should('have.text', [0, 10, 20, 30, 40].join(''));
    cy.get('@yAxis').should('have.text', ['−10', 0, 10, 20, 30].join('')); // Tick text uses minus sign − (U+2212) rather than hyphen minus - (U+002D)

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('heatmap_4d_default');
    }

    // Change ordinate mapping
    cy.get('@yRadioGroup').within(() => {
      cy.findByRole('radio', { name: 'D1' }).click();
    });
    cy.get('@yRadioGroup').within(() => {
      cy.findByRole('radio', { name: 'D1' }).should(
        'have.attr',
        'aria-checked',
        'true'
      );
    });

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('heatmap_4d_remapped');
    }
  });

  it('slice through 4D dataset when visualized as Heatmap', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'fourD' }).click();

    cy.findByRole('figure', { name: 'fourD' }).as('vis').should('exist');

    cy.findAllByRole('slider', { name: 'Dimension slider' })
      .should('have.length', 2)
      .last()
      .should('have.attr', 'aria-valuenow', 0)
      .and('have.attr', 'aria-valuemin', 0)
      .and('have.attr', 'aria-valuemax', 8)
      .as('slider');

    // Move slider up by three marks and check value
    cy.get('@slider').type('{uparrow}');
    cy.get('@slider').should('have.attr', 'aria-valuenow', 1);
    cy.get('@slider').type('{uparrow}');
    cy.get('@slider').should('have.attr', 'aria-valuenow', 2);
    cy.get('@slider').type('{uparrow}');
    cy.get('@slider').should('have.attr', 'aria-valuenow', 3);

    cy.findByRole('figure', { name: 'fourD' }).should('exist');
    cy.get('@vis')
      .should('contain.text', '9.996e-1')
      .and('contain.text', '−1e+0');

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('heatmap_4d_sliced');
    }

    // Move slider up by one mark to reach slice filled only with zeros
    cy.get('@slider').type('{uparrow}');

    cy.findByRole('figure', { name: 'fourD' }).should('exist');
    cy.get('@slider').should('have.attr', 'aria-valuenow', 4);

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('heatmap_4d_zeros');
    }
  });

  it('edit heatmap color map limits', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'twoD' }).click();

    cy.findByRole('button', { name: 'Edit domain' })
      .click()
      .should('have.attr', 'aria-pressed', 'true');

    cy.findByLabelText('min')
      .clear()
      .type('50{enter}')
      .should('have.value', '5e+1');

    cy.findByRole('figure', { name: 'twoD' }).within(() => {
      cy.findByText('5e+1').should('exist');
      cy.findByText('4e+2').should('exist');
    });

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('edit_domain');
    }
  });

  it('visualize image dataset as RGB', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'threeD_rgb' }).click();

    cy.findByRole('heading', { name: 'nD_datasets / threeD_rgb' }).should(
      'exist'
    );
    cy.findByRole('tab', { name: 'RGB' }).should('exist');
    cy.findByRole('figure', { name: 'threeD_rgb' }).should('exist');

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('rgb_image');
    }

    cy.findByRole('radio', { name: 'BGR' }).click();

    if (!!Cypress.env('TAKE_SNAPSHOTS')) {
      cy.wait(SNAPSHOT_DELAY);
      cy.matchImageSnapshot('bgr_image');
    }
  });

  context('NeXus', () => {
    it('visualize default NXdata group as NxImage', () => {
      cy.findByRole('treeitem', { name: 'source.h5' }).click();

      cy.findByRole('heading', { name: 'source.h5' }).should('exist');
      cy.findByRole('tab', { name: 'NX Image' }).should('exist');
      cy.findByRole('figure', { name: 'NeXus 2D' }).should('exist');
    });

    it('visualize dataset with "spectrum" interpretation as NxSpectrum', () => {
      cy.findByRole('treeitem', { name: /nexus_entry/ }).click();
      cy.findByRole('treeitem', { name: 'spectrum (NeXus group)' }).click();

      cy.findByRole('heading', { name: 'nexus_entry / spectrum' }).should(
        'exist'
      );
      cy.findByRole('tab', { name: 'NX Spectrum' }).should('exist');
      cy.findByRole('figure', { name: 'twoD_spectrum (arb. units)' }).should(
        'exist'
      );
      cy.get('svg[data-type="abscissa"] svg').should('have.text', 'X (nm)');

      if (!!Cypress.env('TAKE_SNAPSHOTS')) {
        cy.wait(SNAPSHOT_DELAY);
        cy.matchImageSnapshot('nxspectrum');
      }
    });

    it('visualize dataset with "image" interpretation as NxImage', () => {
      cy.findByRole('treeitem', { name: /nexus_entry/ }).click();
      cy.findByRole('treeitem', { name: 'image (NeXus group)' }).click();

      cy.findByRole('heading', { name: 'nexus_entry / image' }).should('exist');
      cy.findByRole('tab', { name: 'NX Image' }).should('exist');
      cy.findByRole('figure', { name: 'Interference fringes' }).should('exist');
      cy.get('svg[data-type="ordinate"] svg').should(
        'have.text',
        'Angle (degrees)'
      );

      if (!!Cypress.env('TAKE_SNAPSHOTS')) {
        cy.wait(SNAPSHOT_DELAY);
        cy.matchImageSnapshot('nximage');
      }
    });

    it('use axis values to compute axis ticks', () => {
      cy.findByRole('treeitem', { name: /nexus_entry/ }).click();
      cy.findByRole('treeitem', { name: 'image (NeXus group)' }).click();

      cy.get('svg[data-type="abscissa"] .visx-axis-tick').should(
        'have.text',
        ['−20', '−10', '0', '10', '20'].join('') // Tick text uses minus sign − (U+2212) rather than hyphen minus - (U+002D)
      );
    });

    it('visualize dataset with log scales on both axes on NxSpectrum with SILX_style', () => {
      cy.findByRole('treeitem', { name: /nexus_entry/ }).click();
      cy.findByRole('treeitem', { name: /log_spectrum/ }).click();

      cy.findByRole('heading', { name: 'nexus_entry / log_spectrum' }).should(
        'exist'
      );
      cy.findByRole('tab', { name: 'NX Spectrum' }).should('exist');
      cy.findAllByRole('button', { name: 'Log' }).should('have.length', 2);

      if (!!Cypress.env('TAKE_SNAPSHOTS')) {
        cy.wait(SNAPSHOT_DELAY);
        cy.matchImageSnapshot('logspectrum');
      }
    });

    it('visualize signal and auxiliary signals datasets as NxSpectrum', () => {
      cy.findByRole('treeitem', { name: /nexus_entry/ }).click();
      cy.findByRole('treeitem', { name: /spectrum_with_aux/ }).click();

      cy.findByRole('heading', {
        name: 'nexus_entry / spectrum_with_aux',
      }).should('exist');

      if (!!Cypress.env('TAKE_SNAPSHOTS')) {
        cy.wait(SNAPSHOT_DELAY);
        cy.matchImageSnapshot('auxspectrum');
      }
    });

    it('visualize dataset with "rgb-image" interpretation as NxRGB', () => {
      cy.findByRole('treeitem', { name: /nexus_entry/ }).click();
      cy.findByRole('treeitem', { name: /rgb-image/ }).click();

      cy.findByRole('heading', { name: 'nexus_entry / rgb-image' }).should(
        'exist'
      );
      cy.findByRole('tab', { name: 'NX RGB' }).should('exist');
      cy.findByRole('figure', { name: 'RGB CMY DGW' }).should('exist');

      if (!!Cypress.env('TAKE_SNAPSHOTS')) {
        cy.wait(SNAPSHOT_DELAY);
        cy.matchImageSnapshot('nxrgb');
      }
    });
  });
});
