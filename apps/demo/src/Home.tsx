import { Fragment } from 'react';
import { FiAlertCircle, FiChevronsRight } from 'react-icons/fi';
import { Link } from 'wouter';

import styles from './Home.module.css';

function Home() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.max}>
          <h1 className={styles.title}>
            Welcome to <strong>H5Web</strong>
          </h1>
          <p className={styles.intro}>
            Explore and visualize data stored in HDF5 files.{' '}
            <span>Try out our demos below!</span>
          </p>
          <div className={styles.cta}>
            <a
              className={styles.ctaBtn}
              href="https://github.com/silx-kit/h5web/tree/main/packages/app#getting-started-"
              target="_blank"
              rel="noreferrer"
            >
              Getting started
            </a>{' '}
            <a
              className={styles.ctaBtn}
              href="https://github.com/silx-kit/h5web"
              target="_blank"
              rel="noreferrer"
            >
              GitHub repository
            </a>
          </div>
        </div>
      </div>
      <div className={styles.max}>
        <main className={styles.demos}>
          <section>
            <h2>
              <Link to="/h5grove" className={styles.demoLink}>
                H5Grove <FiChevronsRight />
              </Link>
            </h2>
            <p className={styles.demoContext}>
              <a
                href="https://github.com/silx-kit/h5grove/"
                target="_blank"
                rel="noreferrer"
              >
                <code>h5grove</code>
              </a>{' '}
              is a Python package that helps design back-end solutions to serve
              HDF5 file contents (data, metadata, attributes).
            </p>
            <p>
              This demo of H5Web communicates with a basic H5Grove server
              implementation. The following HDF5 files are available:
            </p>
            <ul className={styles.demoFiles}>
              <li>
                <Link to="/h5grove">
                  <strong>water_224.h5</strong>
                </Link>{' '}
                (default) - a typical NeXus file with various real-world
                datasets to demonstrate H5Web’s core visualizations.
              </li>
              <li>
                <Link to="/h5grove?file=compressed.h5">compressed.h5</Link> - a
                file with datasets compressed with various filters to test
                decompression.
              </li>
              <li>
                <Link to="/h5grove?file=epics.h5">epics.h5</Link> - a test file
                from the{' '}
                <a
                  href="https://epics.anl.gov/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <abbr title="Experimental Physics and Industrial Control System">
                    EPICS
                  </abbr>
                </a>{' '}
                group (Argonne National Laboratory).
              </li>
              <li>
                <Link to="/h5grove?file=grove.h5">grove.h5</Link> - a file
                designed to demonstrate the capabilities of{' '}
                <code>H5GroveProvider</code>; it contains datasets with{' '}
                <code>NaN</code>, <code>Infinity</code>, boolean and complex
                values, as well as RGB images and 4D stacks.
              </li>
              <li>
                <Link to="/h5grove?file=links.h5">links.h5</Link> - a file with
                external links, soft links and a virtual dataset to test link
                resolution.
              </li>
              <li>
                <Link to="/h5grove?file=sample.h5">sample.h5</Link> - the file
                used to test <code>H5GroveApi</code> and <code>H5WasmApi</code>{' '}
                internally.
              </li>
              <li>
                <Link to="/h5grove?file=tall.h5">tall.h5</Link> - the demo file
                of HSDS.
              </li>
            </ul>
          </section>
          <section>
            <h2>
              <Link to="/h5wasm" className={styles.demoLink}>
                H5Wasm <FiChevronsRight />
              </Link>
            </h2>
            <p className={styles.demoContext}>
              <a
                href="https://github.com/usnistgov/h5wasm"
                target="_blank"
                rel="noreferrer"
              >
                <code>h5wasm</code>
              </a>{' '}
              is a WebAssembly-powered library, based on the{' '}
              <a
                href="http://portal.hdfgroup.org/pages/viewpage.action?pageId=50073943"
                target="_blank"
                rel="noreferrer"
              >
                HDF5 C API
              </a>
              , for reading and writing HDF5 files from JavaScript.
            </p>
            <p>
              This demo allows you to <strong>open any HDF5 files</strong> on
              your computer with H5Web. Note that if your files contain external
              links, they will not be resolved.
            </p>
            <p>
              You can also provide the URL of a file hosted on a{' '}
              <strong>static server</strong>. For instance, try these files
              hosted on{' '}
              <a
                href="http://www.silx.org/pub/h5web/"
                target="_blank"
                rel="noreferrer"
              >
                silx.org
              </a>
              :{' '}
              {[
                'water_224.h5',
                'epics.h5',
                'grove.h5',
                'sample.h5',
                'tall.h5 ',
              ].map((filename, index) => (
                <Fragment key={filename}>
                  {index > 0 && ', '}
                  <Link
                    to={`/h5wasm?url=${encodeURIComponent(
                      `https://www.silx.org/pub/h5web/${filename}`,
                    )}`}
                  >
                    {filename}
                  </Link>
                </Fragment>
              ))}
            </p>
            <div className={styles.tip}>
              <FiAlertCircle className={styles.tipIcon} />
              <p>
                This demo may break at any time. For a more stable and
                featureful solution, please take a look at{' '}
                <a href="https://myhdf5.hdfgroup.org/">myHDF5</a> or H5Web’s{' '}
                <a href="https://marketplace.visualstudio.com/items?itemName=h5web.vscode-h5web">
                  VS Code extension
                </a>
                .
              </p>
            </div>
          </section>
          <section>
            <h2>
              <Link to="/hsds" className={styles.demoLink}>
                HSDS <FiChevronsRight />
              </Link>
            </h2>
            <p className={styles.demoContext}>
              <a
                href="https://github.com/HDFGroup/hsds"
                target="_blank"
                rel="noreferrer"
              >
                HSDS
              </a>{' '}
              is a back-end solution specialised in serving HDF5 files from
              object storage (AWS S3, Azure Blob Storage, or OpenIO).
            </p>
            <p>
              This demo communicates with an HSDS test server, which serves the
              same files as the H5Grove demo above:{' '}
              <Link to="/hsds">
                <strong>water_224.h5</strong>
              </Link>{' '}
              (default),{' '}
              <Link to="/hsds?file=compressed.h5">compressed.h5</Link> (note
              that bitshuffle is not yet supported by HSDS),{' '}
              <Link to="/hsds?file=epics.h5">epics.h5</Link>,{' '}
              <Link to="/hsds?file=grove.h5">grove.h5</Link>,{' '}
              <Link to="/hsds?file=links.h5">links.h5</Link>,{' '}
              <Link to="/hsds?file=tall.h5">tall.h5</Link>.
            </p>
          </section>
          <section>
            <h2>
              <Link to="/mock?custom" className={styles.demoLink}>
                Mock data <FiChevronsRight />
              </Link>
            </h2>
            <p>
              This demo is used for development and automated testing purposes.
              It provides a good overview of H5Web’s functionalities, including
              the core visualizations and their toolbars, slicing and mapping of
              nD datasets, NeXus visualizations and default plot detection, RGB
              images, error handling, loading state, etc.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Home;
