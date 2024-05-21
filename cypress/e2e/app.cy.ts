// For ARIA-based checks
const BE_SELECTED = ['have.attr', 'aria-selected', 'true'] as const;
const BE_CHECKED = ['have.attr', 'aria-checked', 'true'] as const;

describe('/mock', () => {
  beforeEach(() => {
    cy.visit('/mock');
    cy.waitForStableDOM();
  });

  it('visualize 1D dataset as Line', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('oneD');

    cy.findByRole('tab', { name: 'Line' }).should(...BE_SELECTED);
    cy.findByRole('figure', { name: 'oneD' }).should('be.visible');
    cy.findByRole('heading', { name: 'nD_datasets / oneD' }).should(
      'be.visible',
    );

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('line_1D');
    }
  });

  it('visualize 1D complex dataset as Line', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('oneD_cplx');

    cy.findByRole('tab', { name: 'Line' }).should(...BE_SELECTED);
    cy.findByRole('figure', { name: 'oneD_cplx' }).should('be.visible');
    cy.findByRole('heading', { name: 'nD_datasets / oneD_cplx' }).should(
      'be.visible',
    );

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('line_complex_1D');
    }
  });

  it('visualize 1D dataset as Matrix', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('oneD');
    cy.selectVisTab('Matrix');

    cy.findByRole('tab', { name: 'Matrix' }).should(...BE_SELECTED);
    cy.findByRole('table').should('be.visible');
    cy.findAllByRole('cell')
      .first()
      .should('have.attr', 'aria-rowindex', 0)
      .and('have.attr', 'aria-colindex', 0);
  });

  it('visualize 1D compound dataset as Matrix', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('oneD_compound');
    cy.selectVisTab('Matrix');

    cy.findByRole('tab', { name: 'Matrix' }).should(...BE_SELECTED);
    cy.findByRole('table').should('be.visible');
    cy.findAllByRole('cell')
      .first()
      .should('have.attr', 'aria-rowindex', 0)
      .and('have.attr', 'aria-colindex', 0);
  });

  it('visualize 2D dataset as Heatmap', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('twoD');

    cy.findByRole('tab', { name: 'Heatmap' }).should(...BE_SELECTED);
    cy.findByRole('figure', { name: 'twoD' }).should('be.visible');
    cy.findByRole('heading', { name: 'nD_datasets / twoD' }).should(
      'be.visible',
    );

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('heatmap_2D');
    }

    cy.findByRole('button', { name: 'More controls' }).click();
    cy.findByRole('button', { name: 'Invert' }).click();
    cy.waitForStableDOM();

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('heatmap_2D_inverted_cmap');
    }
  });

  it('visualize 2D complex dataset as Heatmap', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('twoD_cplx');

    cy.findByRole('tab', { name: 'Heatmap' }).should(...BE_SELECTED);
    cy.findByRole('figure', { name: 'twoD_cplx (amplitude)' }).should(
      'be.visible',
    );
    cy.findByRole('heading', { name: 'nD_datasets / twoD_cplx' }).should(
      'be.visible',
    );

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('heatmap_2D_complex');
    }
  });

  it('map dimensions of 4D dataset when visualized as Heatmap', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('fourD');

    cy.findByTitle('Number of elements in each dimension')
      .parent()
      .parent()
      .should('have.text', 'n 3 9 20 41');

    cy.findByRole('radiogroup', { name: /x axis/u }).as('xRadioGroup');
    cy.findByRole('radiogroup', { name: /y axis/u }).as('yRadioGroup');
    cy.get('svg[data-type="abscissa"]').as('xAxis');
    cy.get('svg[data-type="ordinate"]').as('yAxis');

    // Check default dimension mapping
    cy.get('@xRadioGroup').within(() => {
      cy.findByRole('radio', { name: 'D3' }).should(...BE_CHECKED);
    });
    cy.get('@yRadioGroup').within(() => {
      cy.findByRole('radio', { name: 'D2' }).should(...BE_CHECKED);
    });

    // Check axes ticks
    cy.get('@xAxis').should('have.text', [0, 10, 20, 30, 40].join(''));
    cy.get('@yAxis').should('have.text', ['−10', 0, 10, 20, 30].join('')); // minus sign − (U+2212), not hyphen - (U+002D)

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('heatmap_4d_default');
    }

    // Change ordinate mapping
    cy.get('@yRadioGroup').within(() => {
      cy.findByRole('radio', { name: 'D1' }).click();
    });
    cy.waitForStableDOM();

    cy.get('@yRadioGroup').within(() => {
      cy.findByRole('radio', { name: 'D1' }).should(...BE_CHECKED);
    });

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('heatmap_4d_remapped');
    }
  });

  it('slice through 4D dataset when visualized as Heatmap', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('fourD');

    cy.findByRole('figure', { name: 'fourD' }).as('vis').should('be.visible');
    cy.findAllByRole('slider', { name: /D[0-9]/u }).should('have.length', 2);
    cy.findByRole('slider', { name: 'D1' })
      .as('d1Slider')
      .should('have.attr', 'aria-valuenow', 0)
      .and('have.attr', 'aria-valuemin', 0)
      .and('have.attr', 'aria-valuemax', 8);

    // Move slider up by three marks and check value
    cy.get('@d1Slider').type('{upArrow}{upArrow}{upArrow}');
    cy.waitForStableDOM();

    cy.get('@d1Slider').should('have.attr', 'aria-valuenow', 3);
    cy.get('@vis')
      .should('contain.text', '9.996e-1')
      .and('contain.text', '−1e+0');

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('heatmap_4d_sliced');
    }

    // Move slider up by one mark to reach slice filled only with zeros
    cy.get('@d1Slider').type('{upArrow}');
    cy.waitForStableDOM();

    cy.get('@d1Slider').should('have.attr', 'aria-valuenow', 4);
    cy.get('@vis').should('contain.text', '+∞').and('contain.text', '−∞');

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('heatmap_4d_zeros');
    }
  });

  it('edit heatmap color map limits', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('twoD');

    cy.findByRole('button', { name: 'Edit domain' })
      .click()
      .should('have.attr', 'aria-pressed', 'true');

    cy.findByLabelText('min').clear().type('50').as('min');
    cy.findByRole('button', { name: 'Apply min' }).click();
    cy.waitForStableDOM();

    cy.get('@min').should('have.value', '5e+1');
    cy.findByRole('figure', { name: 'twoD' }).within(() => {
      cy.findByText('5e+1').should('be.visible');
      cy.findByText('4e+2').should('be.visible');
    });

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('heatmap_domain');
    }
  });

  it('flip heatmap', () => {
    cy.selectExplorerNode('typed_arrays');
    cy.selectExplorerNode('uint8');

    cy.findByRole('button', { name: 'More controls' }).click();

    cy.findByRole('button', { name: 'Flip X' })
      .click()
      .should('have.attr', 'aria-pressed', 'true');

    cy.findByRole('button', { name: 'Flip Y' })
      .click()
      .should('have.attr', 'aria-pressed', 'true');

    cy.waitForStableDOM();

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('heatmap_flip');
    }
  });

  it('visualize image dataset as RGB', () => {
    cy.selectExplorerNode('nD_datasets');
    cy.selectExplorerNode('threeD_rgb');

    cy.findByRole('tab', { name: 'RGB' }).should(...BE_SELECTED);
    cy.findByRole('figure', { name: 'threeD_rgb' }).should('be.visible');
    cy.findByRole('heading', { name: 'nD_datasets / threeD_rgb' }).should(
      'be.visible',
    );

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('rgb_image');
    }

    cy.findByRole('radio', { name: 'BGR' }).click();
    cy.waitForStableDOM();

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('bgr_image');
    }
  });

  it('search items in the file', () => {
    cy.findByRole('tab', { name: 'Search' }).click();

    cy.findByRole('textbox', { name: 'Path to search' }).type('scatter');

    cy.findAllByRole('treeitem')
      .should('have.length', 3)
      .each((e) => expect(e).to.contain('scatter'));

    cy.findByRole('treeitem', { name: '/nexus_entry/scatter' }).click();
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
    it('visualize default NXdata group as NxImage', () => {
      cy.selectExplorerNode('source.h5');

      cy.findByRole('tab', { name: 'NX Heatmap' }).should(...BE_SELECTED);
      cy.findByRole('heading', { name: 'source.h5' }).should('be.visible');
      cy.findByRole('figure', { name: 'NeXus 2D' }).should('be.visible');
    });

    it('visualize dataset with "spectrum" interpretation as NxSpectrum', () => {
      cy.selectExplorerNode('nexus_entry');
      cy.selectExplorerNode('spectrum');

      cy.findByRole('tab', { name: 'NX Line' }).should(...BE_SELECTED);
      cy.findByRole('heading', { name: 'nexus_entry / spectrum' }).should(
        'be.visible',
      );
      cy.findByRole('figure', { name: 'twoD (arb. units)' }).should(
        'be.visible',
      );

      cy.get('svg[data-type="abscissa"] svg').should('have.text', 'X (nm)');

      if (Cypress.env('TAKE_SNAPSHOTS')) {
        cy.matchImageSnapshot('nxspectrum');
      }
    });

    it('visualize dataset with "image" interpretation as NxImage', () => {
      cy.selectExplorerNode('nexus_entry');
      cy.selectExplorerNode('image');

      cy.findByRole('tab', { name: 'NX Heatmap' }).should(...BE_SELECTED);
      cy.findByRole('heading', { name: 'nexus_entry / image' }).should(
        'be.visible',
      );
      cy.findByRole('figure', { name: 'Interference fringes' }).should(
        'be.visible',
      );

      cy.get('svg[data-type="ordinate"] svg').should(
        'have.text',
        'Angle (degrees)',
      );

      if (Cypress.env('TAKE_SNAPSHOTS')) {
        cy.matchImageSnapshot('nximage');
      }
    });

    it('use axis values to compute axis ticks', () => {
      cy.selectExplorerNode('nexus_entry');
      cy.selectExplorerNode('image');

      cy.get('svg[data-type="abscissa"] .visx-axis-tick').should(
        'have.text',
        ['−20', '−10', '0', '10', '20'].join(''), // minus sign − (U+2212), not hyphen - (U+002D)
      );
    });

    it('visualize dataset with log scales on both axes on NxSpectrum with SILX_style', () => {
      cy.selectExplorerNode('nexus_entry');
      cy.selectExplorerNode('log_spectrum');

      cy.findByRole('tab', { name: 'NX Line' }).should(...BE_SELECTED);
      cy.findByRole('heading', { name: 'nexus_entry / log_spectrum' }).should(
        'be.visible',
      );

      cy.findAllByRole('combobox', { name: /Log/u }).should('have.length', 2);

      if (Cypress.env('TAKE_SNAPSHOTS')) {
        cy.waitForStableDOM();
        cy.matchImageSnapshot('logspectrum');
      }
    });

    it('visualize signal and auxiliary signals datasets as NxSpectrum', () => {
      cy.selectExplorerNode('nexus_entry');
      cy.selectExplorerNode('spectrum_with_aux');

      cy.findByRole('heading', {
        name: 'nexus_entry / spectrum_with_aux',
      }).should('be.visible');

      if (Cypress.env('TAKE_SNAPSHOTS')) {
        cy.matchImageSnapshot('auxspectrum');
      }
    });

    it('visualize auxiliary signal datasets as NxImage', () => {
      cy.selectExplorerNode('nexus_entry');
      cy.selectExplorerNode('image_with_aux');

      cy.findByRole('heading', {
        name: 'nexus_entry / image_with_aux',
      }).should('be.visible');
      cy.findByRole('figure', { name: 'twoD' }).should('be.visible');

      cy.findByRole('radio', { name: 'tertiary' }).click();
      cy.waitForStableDOM();

      cy.findByRole('figure', { name: 'tertiary' })
        .should('be.visible')
        .and('contain.text', '−4.75e+1'); // color bar min

      if (Cypress.env('TAKE_SNAPSHOTS')) {
        cy.matchImageSnapshot('auximage');
      }
    });

    it('visualize dataset with "rgb-image" interpretation as NxRGB', () => {
      cy.selectExplorerNode('nexus_entry');
      cy.selectExplorerNode('rgb-image');

      cy.findByRole('tab', { name: 'NX RGB' }).should(...BE_SELECTED);
      cy.findByRole('figure', { name: 'RGB CMY DGW' }).should('be.visible');
      cy.findByRole('heading', { name: 'nexus_entry / rgb-image' }).should(
        'be.visible',
      );
      cy.waitForStableDOM();

      if (Cypress.env('TAKE_SNAPSHOTS')) {
        cy.matchImageSnapshot('nxrgb');
      }
    });

    it('visualize dataset with 1D signal and two 1D axes of same length as NxScatter', () => {
      cy.selectExplorerNode('nexus_entry');
      cy.selectExplorerNode('scatter');

      cy.findByRole('tab', { name: 'NX Scatter' }).should(...BE_SELECTED);
      cy.findByRole('figure', { name: 'scatter_data' }).should('be.visible');
      cy.findByRole('heading', { name: 'nexus_entry / scatter' }).should(
        'be.visible',
      );

      if (Cypress.env('TAKE_SNAPSHOTS')) {
        cy.matchImageSnapshot('nxscatter');
      }
    });
  });
});

describe('/mock?wide', () => {
  beforeEach(() => {
    cy.visit('/mock?wide');
    cy.waitForStableDOM();
  });

  it('start with sidebar closed', () => {
    cy.findByRole('tree').should('not.exist');

    if (Cypress.env('TAKE_SNAPSHOTS')) {
      cy.matchImageSnapshot('wide');
    }
  });
});
