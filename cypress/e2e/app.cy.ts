const takeSnapshots: boolean = Cypress.expose('takeSnapshots') || false;

// For ARIA-based checks
const BE_SELECTED = ['have.attr', 'aria-selected', 'true'] as const;
const BE_CHECKED = ['have.attr', 'aria-checked', 'true'] as const;

describe('/mock', () => {
  beforeEach(() => {
    cy.visit('/mock');
    cy.waitForStableDOM();
  });

  it('visualize 1D dataset as Line', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('oneD');

    cy.getByRole('tab', { name: 'Line' }).should(...BE_SELECTED);
    cy.getByRole('figure', { name: 'oneD' }).should('be.visible');
    cy.getByRole('heading', { name: 'arrays / oneD' }).should('be.visible');

    if (takeSnapshots) {
      cy.matchImageSnapshot('line_1D');
    }

    cy.getByRole('button', { name: 'More controls' }).click();
    cy.getByRole('button', { name: 'Aspect' }).click();
    cy.findByLabelText('Points').click();
    cy.waitForStableDOM();

    if (takeSnapshots) {
      cy.matchImageSnapshot('line_1D_points');
    }
  });

  it('visualize 1D complex dataset as Line', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('oneD_complex');

    cy.getByRole('tab', { name: 'Line' }).should(...BE_SELECTED);
    cy.getByRole('figure', { name: 'oneD_complex' }).should('be.visible');
    cy.getByRole('heading', { name: 'arrays / oneD_complex' }).should(
      'be.visible',
    );

    if (takeSnapshots) {
      cy.matchImageSnapshot('line_complex_1D');
    }
  });

  it('visualize 1D dataset as Matrix', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('oneD');
    cy.selectVisTab('Matrix');

    cy.getByRole('tab', { name: 'Matrix' }).should(...BE_SELECTED);
    cy.getByRole('grid').should('be.visible');
    cy.getByRole('gridcell', { native: false })
      .first()
      .should('have.attr', 'aria-colindex', 1)
      .and('have.text', '4.000e+2')
      .parent()
      .should('have.attr', 'role', 'row')
      .and('have.attr', 'aria-rowindex', 1);

    if (takeSnapshots) {
      cy.matchImageSnapshot('matrix_1D');
    }
  });

  it('visualize 1D compound dataset', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('oneD_compound');
    cy.selectVisTab('Compound');

    cy.getByRole('tab', { name: 'Compound' }).should(...BE_SELECTED);
    cy.getByRole('grid').should('be.visible');
    cy.getByRole('gridcell', { native: false })
      .first()
      .should('have.attr', 'aria-colindex', 1)
      .and('have.text', 'Hydrogen')
      .parent()
      .should('have.attr', 'role', 'row')
      .and('have.attr', 'aria-rowindex', 1);

    cy.getByRole('columnheader', { native: false })
      .first()
      .should('have.attr', 'aria-colindex', 1)
      .and('have.text', 'string');

    if (takeSnapshots) {
      cy.matchImageSnapshot('compound_1D');
    }
  });

  it('visualize 2D dataset as Heatmap', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('twoD');

    cy.getByRole('tab', { name: 'Heatmap' }).should(...BE_SELECTED);
    cy.getByRole('figure', { name: 'twoD' }).should('be.visible');
    cy.getByRole('heading', { name: 'arrays / twoD' }).should('be.visible');

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_2D');
    }

    cy.getByRole('button', { name: 'More controls' }).click();
    cy.getByRole('button', { name: 'Invert' }).click();
    cy.waitForStableDOM();

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_2D_inverted_cmap');
    }
  });

  it('visualize 2D complex dataset as Heatmap', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('twoD_complex');

    cy.getByRole('tab', { name: 'Heatmap' }).should(...BE_SELECTED);
    cy.getByRole('figure', { name: 'twoD_complex (amplitude)' }).should(
      'be.visible',
    );
    cy.getByRole('heading', { name: 'arrays / twoD_complex' }).should(
      'be.visible',
    );

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_2D_complex');
    }
  });

  it('visualize dataset with fill value', () => {
    cy.selectExplorerNode('netcdf');

    cy.selectExplorerNode('_FillValue');
    cy.getByRole('figure', { name: '_FillValue' }).should('be.visible');

    if (takeSnapshots) {
      cy.matchImageSnapshot('fillvalue_2D');
    }

    cy.selectVisTab('Line');
    cy.waitForStableDOM();

    if (takeSnapshots) {
      cy.matchImageSnapshot('fillvalue_1D');
    }
  });

  it('map dimensions of 4D dataset when visualized as Heatmap', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('fourD');

    cy.findByTitle('Number of elements in each dimension')
      .parent()
      .parent()
      .should('have.text', 'n 3 9 20 41');

    cy.getByRole('radiogroup', { name: /x axis/u }).as('xRadioGroup');
    cy.getByRole('radiogroup', { name: /y axis/u }).as('yRadioGroup');
    cy.get('svg[data-type="abscissa"]').as('xAxis');
    cy.get('svg[data-type="ordinate"]').as('yAxis');

    // Check default dimension mapping
    cy.get('@xRadioGroup').within(() => {
      cy.getByRole('radio', { name: 'D3', native: false }).should(
        ...BE_CHECKED,
      );
    });
    cy.get('@yRadioGroup').within(() => {
      cy.getByRole('radio', { name: 'D2', native: false }).should(
        ...BE_CHECKED,
      );
    });

    // Check axes ticks
    cy.get('@xAxis').should('have.text', [0, 10, 20, 30, 40].join(''));
    cy.get('@yAxis').should('have.text', ['−10', 0, 10, 20, 30].join('')); // minus sign − (U+2212), not hyphen - (U+002D)

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_4d_default');
    }

    // Change ordinate mapping
    cy.get('@yRadioGroup').within(() => {
      cy.getByRole('radio', { name: 'D1', native: false }).click();
    });
    cy.waitForStableDOM();

    cy.get('@yRadioGroup').within(() => {
      cy.getByRole('radio', { name: 'D1', native: false }).should(
        ...BE_CHECKED,
      );
    });

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_4d_remapped');
    }
  });

  it('slice through 4D dataset when visualized as Heatmap', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('fourD');

    cy.getByRole('figure', { name: 'fourD' }).as('vis').should('be.visible');
    cy.getByRole('slider', { name: /D\d/u, native: false }).should(
      'have.length',
      2,
    );
    cy.getByRole('slider', { name: 'D1', native: false })
      .as('d1Slider')
      .should('have.attr', 'aria-valuenow', 0)
      .and('have.attr', 'aria-valuemin', 0)
      .and('have.attr', 'aria-valuemax', 8);

    // Move slider up by three marks and check value
    cy.get('@d1Slider').focus();
    cy.press(Cypress.Keyboard.Keys.UP);
    cy.press(Cypress.Keyboard.Keys.UP);
    cy.press(Cypress.Keyboard.Keys.UP);
    cy.waitForStableDOM();

    cy.get('@d1Slider').should('have.attr', 'aria-valuenow', 3);
    cy.get('@vis')
      .should('contain.text', '9.996e-1')
      .and('contain.text', '−1e+0');

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_4d_sliced');
    }

    // Move slider up by one mark to reach slice filled only with zeros
    cy.get('@d1Slider').focus();
    cy.press(Cypress.Keyboard.Keys.UP);
    cy.waitForStableDOM();

    cy.get('@d1Slider').should('have.attr', 'aria-valuenow', 4);
    cy.get('@vis').should('contain.text', '+∞').and('contain.text', '−∞');

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_4d_zeros');
    }
  });

  it('visualize line with constant interpolation', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('oneD');

    cy.getByRole('button', { name: 'More controls' }).click();
    cy.getByRole('button', { name: 'Aspect' }).click();
    cy.findByLabelText('Constant').click();
    cy.waitForStableDOM();

    if (takeSnapshots) {
      cy.matchImageSnapshot('line_constant');
    }

    cy.selectExplorerNode('oneD_complex');
    cy.waitForStableDOM();

    if (takeSnapshots) {
      cy.matchImageSnapshot('line_complex_constant');
    }
  });

  it('edit heatmap color map limits', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('twoD');

    cy.getByRole('button', { name: 'Edit domain' })
      .click()
      .should('have.attr', 'aria-pressed', 'true');

    cy.findByLabelText('min').clear().type('50').as('min');
    cy.getByRole('button', { name: 'Apply min' }).click();
    cy.waitForStableDOM();

    cy.get('@min').should('have.value', '5e+1');
    cy.getByRole('figure', { name: 'twoD' }).within(() => {
      cy.findByText('5e+1').should('be.visible');
      cy.findByText('4e+2').should('be.visible');
    });

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_domain');
    }
  });

  it('flip heatmap', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('typed');
    cy.selectExplorerNode('uint8');

    cy.getByRole('button', { name: 'More controls' }).click();

    cy.getByRole('button', { name: 'Flip X' })
      .click()
      .should('have.attr', 'aria-pressed', 'true');

    cy.getByRole('button', { name: 'Flip Y' })
      .click()
      .should('have.attr', 'aria-pressed', 'true');

    cy.waitForStableDOM();

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_flip');
    }
  });

  it('visualize heatmap as 3D surface', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('twoD');

    cy.findByRole('button', { name: 'More controls' }).click();

    cy.findByRole('button', { name: 'Show as 3D surface' })
      .click()
      .should('have.attr', 'aria-pressed', 'true');

    cy.findByRole('figure', { name: 'twoD' }).should('be.visible');
    cy.waitForStableDOM();

    if (takeSnapshots) {
      cy.matchImageSnapshot('heatmap_surface');
    }
  });

  it('visualize image dataset as RGB/BGR or RGBA/BGRA', () => {
    cy.selectExplorerNode('arrays');
    cy.selectExplorerNode('threeD_rgb');

    cy.getByRole('tab', { name: 'RGB' }).should(...BE_SELECTED);
    cy.getByRole('figure', { name: 'threeD_rgb' }).should('be.visible');
    cy.getByRole('heading', { name: 'arrays / threeD_rgb' }).should(
      'be.visible',
    );

    if (takeSnapshots) {
      cy.matchImageSnapshot('rgb_image');
    }

    cy.getByRole('radio', { name: 'BGR', native: false }).click();
    cy.waitForStableDOM();

    if (takeSnapshots) {
      cy.matchImageSnapshot('bgr_image');
    }

    cy.selectExplorerNode('threeD_rgba');
    cy.getByRole('tab', { name: 'RGB' }).should(...BE_SELECTED);
    cy.getByRole('figure', { name: 'threeD_rgba' }).should('be.visible');
    cy.getByRole('heading', { name: 'arrays / threeD_rgba' }).should(
      'be.visible',
    );

    if (takeSnapshots) {
      cy.matchImageSnapshot('bgra_image');
    }

    cy.getByRole('radio', { name: 'RGB', native: false }).click();
    cy.waitForStableDOM();

    if (takeSnapshots) {
      cy.matchImageSnapshot('rgba_image');
    }
  });

  it('search items in the file', () => {
    cy.getByRole('tab', { name: 'Search' }).click();

    cy.getByRole('textbox', { name: 'Path to search' }).type('scatter');

    cy.getByRole('treeitem')
      .should('have.length', 3)
      .each((e) => expect(e).to.contain('scatter'));

    cy.getByRole('treeitem', { name: '/nexus/scatter' }).click();
    cy.waitForStableDOM();

    cy.getByRole('figure', { name: 'scatter_data' }).should('be.visible');

    // Check that the selected node is kept when tabbing in Explorer
    cy.getByRole('tab', { name: 'Explorer' }).click();
    cy.getExplorerNode('scatter').should('have.attr', 'aria-selected', 'true');
    // And has focus
    cy.getExplorerNode('scatter').should('have.focus');

    // Check that the search value is kept when tabbing back from Explorer
    cy.getByRole('tab', { name: 'Search' }).click();
    cy.getByRole('textbox', { name: 'Path to search' }).should(
      'have.value',
      'scatter',
    );
  });

  context('NeXus', () => {
    it('visualize default NXdata group as NxHeatmap', () => {
      cy.selectExplorerNode('source.h5');

      cy.getByRole('tab', { name: 'NX Heatmap' }).should(...BE_SELECTED);
      cy.getByRole('heading', { name: 'source.h5' }).should('be.visible');
      cy.getByRole('figure', { name: 'NeXus 2D' }).should('be.visible');
    });

    it('visualize dataset with "spectrum" interpretation as NxLine', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('spectrum');

      cy.getByRole('tab', { name: 'NX Line' }).should(...BE_SELECTED);
      cy.getByRole('heading', { name: 'nexus / spectrum' }).should(
        'be.visible',
      );
      cy.getByRole('figure', { name: 'twoD (arb. units)' }).should(
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

      cy.getByRole('tab', { name: 'NX Heatmap' }).should(...BE_SELECTED);
      cy.getByRole('heading', { name: 'nexus / image' }).should('be.visible');
      cy.getByRole('figure', { name: 'Interference fringes' }).should(
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

      cy.getByRole('tab', { name: 'NX Heatmap' }).should(...BE_SELECTED);
      cy.getByRole('heading', { name: 'nexus / default_slice' }).should(
        'be.visible',
      );

      cy.getByRole('slider', { name: /D\d/u, native: false }).should(
        'have.length',
        2,
      );
      cy.getByRole('slider', { name: 'D0', native: false }).should(
        'have.attr',
        'aria-valuenow',
        1,
      );
      cy.getByRole('slider', { name: 'D2', native: false }).should(
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

      cy.getByRole('tab', { name: 'NX Line' }).should(...BE_SELECTED);
      cy.getByRole('heading', { name: 'nexus / spectrum_log' }).should(
        'be.visible',
      );

      cy.getByRole('combobox', { name: /Log/u, native: false }).should(
        'have.length',
        2,
      );

      if (takeSnapshots) {
        cy.waitForStableDOM();
        cy.matchImageSnapshot('nxline_log');
      }
    });

    it('visualize signal and auxiliary signals datasets as NxLine', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('spectrum_with_aux');

      cy.getByRole('heading', {
        name: 'nexus / spectrum_with_aux',
      }).should('be.visible');

      if (takeSnapshots) {
        cy.matchImageSnapshot('auxspectrum');
      }
    });

    it('visualize auxiliary signal datasets as NxHeatmap', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('image_with_aux');

      cy.getByRole('heading', {
        name: 'nexus / image_with_aux',
      }).should('be.visible');
      cy.getByRole('figure', { name: 'twoD' }).should('be.visible');

      cy.getByRole('button', { name: 'Signals' }).click();
      cy.getByRole('radio', { name: 'tertiary' }).click();

      cy.getByRole('figure', { name: 'tertiary' })
        .should('be.visible')
        .and('contain.text', '−4.75e+1'); // color bar min

      if (takeSnapshots) {
        cy.matchImageSnapshot('auximage');
      }
    });

    it('visualize 2D complex signal with "spectrum" interpretation and auxiliaries as NxLine', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('spectrum_complex');

      cy.getByRole('heading', {
        name: 'nexus / spectrum_complex',
      }).should('be.visible');

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxline_complex_2d_aux');
      }
    });

    it('visualize 2D complex signal as NxHeatmap', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('image_complex');

      cy.getByRole('heading', {
        name: 'nexus / image_complex',
      }).should('be.visible');

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxheatmap_complex_2d');
      }

      // Select float auxiliary signal
      cy.getByRole('button', { name: 'Signals' }).click();
      cy.getByRole('radio', { name: 'tertiary_float' }).click();

      cy.getByRole('figure', { name: 'tertiary_float' }).should('be.visible');
      cy.waitForStableDOM();

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxheatmap_complex_2d_float_aux');
      }
    });

    it('visualize signals with "rgb-image" and "rgba-image" interpretations as NxRGB', () => {
      cy.selectExplorerNode('nexus');
      cy.selectExplorerNode('rgb-image');

      cy.getByRole('tab', { name: 'NX RGB' }).should(...BE_SELECTED);
      cy.getByRole('figure', { name: 'RGB' }).should('be.visible');
      cy.getByRole('heading', { name: 'nexus / rgb-image' }).should(
        'be.visible',
      );
      cy.waitForStableDOM();

      if (takeSnapshots) {
        cy.matchImageSnapshot('nxrgb');
      }

      cy.selectExplorerNode('rgba-image');
      cy.getByRole('tab', { name: 'NX RGB' }).should(...BE_SELECTED);
      cy.getByRole('figure', { name: 'RGBA' }).should('be.visible');
      cy.getByRole('heading', { name: 'nexus / rgba-image' }).should(
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

      cy.getByRole('tab', { name: 'NX Scatter' }).should(...BE_SELECTED);
      cy.getByRole('figure', { name: 'scatter_data' }).should('be.visible');
      cy.getByRole('heading', { name: 'nexus / scatter' }).should('be.visible');

      if (takeSnapshots) {
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
    cy.getByRole('tree').should('not.exist');

    if (takeSnapshots) {
      cy.matchImageSnapshot('wide');
    }
  });
});
