/// <reference types="cypress" />

describe('App', () => {
  beforeEach(() => {
    cy.visit('/mock');
  });

  it('visualize 1D dataset as Line', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'oneD' }).click();

    cy.findByRole('heading', { name: 'nD_datasets / oneD' }).should('exist');
    cy.findByRole('tab', { name: 'Line' }).should('exist');
    cy.findByRole('figure', { name: 'oneD' }).should('exist');
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
  });

  it('map dimensions of 4D dataset when visualized as Heatmap', () => {
    cy.findByRole('treeitem', { name: 'nD_datasets' }).click();
    cy.findByRole('treeitem', { name: 'fourD' }).click();

    cy.findByText('n').parent().should('have.text', 'n 3 9 20 41');

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
    cy.get('@yAxis').should('have.text', [0, 5, 10, 15, 20].join(''));

    // Change ordinate mapping and check that axis ticks have changed
    cy.get('@yRadioGroup').within(() => {
      cy.findByRole('radio', { name: 'D1' }).click();
    });
    cy.get('@yAxis').should('have.text', [0, 2, 4, 6, 8].join(''));
  });

  context('NeXus', () => {
    it('visualize default NXdata group as NxImage', () => {
      cy.findByRole('treeitem', { name: 'source.h5' }).click();

      cy.findByRole('heading', { name: 'source.h5' }).should('exist');
      cy.findByRole('tab', { name: 'NX Image' }).should('exist');
      cy.findByRole('figure', { name: 'NeXus 2D' }).should('exist');
    });

    it('visualize dataset with spectrum interpretation as NxSprectrum', () => {
      cy.findByRole('treeitem', { name: 'nexus_entry' }).click();
      cy.findByRole('treeitem', { name: 'spectrum' }).click();

      cy.findByRole('heading', { name: 'nexus_entry / spectrum' }).should(
        'exist'
      );
      cy.findByRole('tab', { name: 'NX Spectrum' }).should('exist');
    });

    it('visualize dataset with image interpretation as NxImage', () => {
      cy.findByRole('treeitem', { name: 'nexus_entry' }).click();
      cy.findByRole('treeitem', { name: 'image' }).click();

      cy.findByRole('heading', { name: 'nexus_entry / image' }).should('exist');
      cy.findByRole('tab', { name: 'NX Image' }).should('exist');
      cy.wait(500);
    });

    it('use signal name and units to compute title', () => {
      cy.findByRole('treeitem', { name: 'nexus_entry' }).click();
      cy.findByRole('treeitem', { name: 'spectrum' }).click();

      cy.findByRole('figure', { name: 'oneD (arb. units)' }).should('exist');
    });

    it('use signal long name to compute title', () => {
      cy.findByRole('treeitem', { name: 'nexus_entry' }).click();
      cy.findByRole('treeitem', { name: 'image' }).click();

      cy.findByRole('figure', { name: 'Interference fringes' }).should('exist');
    });

    it('use axis name and units to compute axis label', () => {
      cy.findByRole('treeitem', { name: 'nexus_entry' }).click();
      cy.findByRole('treeitem', { name: 'spectrum' }).click();

      cy.get('svg[data-type="abscissa"] svg').should('have.text', 'X (nm)');
    });

    it('use axis long name to compute axis label', () => {
      cy.findByRole('treeitem', { name: 'nexus_entry' }).click();
      cy.findByRole('treeitem', { name: 'image' }).click();

      cy.get('svg[data-type="ordinate"] svg').should(
        'have.text',
        'Angle (degrees)'
      );
    });
  });
});
