"use client";

import Link from "next/link";
import { CodeBlock, Figure, Note, OpenPanelStep, PartHead, Step, Sub } from "./parts";
import { NODE_GUIDE, TOPOLOGIES, type TopologyKey } from "./data";

function Chooser({
  value,
  onChange
}: {
  value: TopologyKey;
  onChange: (k: TopologyKey) => void;
}) {
  return (
    <div className="topo-chooser" role="group" aria-label="Connection topology">
      {TOPOLOGIES.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`topo-card ${value === t.key ? "is-selected" : ""}`}
          aria-pressed={value === t.key}
          onClick={() => onChange(t.key)}
        >
          <span className="topo-card-when">{t.when}</span>
          <span className="topo-card-label">{t.label}</span>
          <span className="topo-card-blurb">{t.blurb}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- steps that differ per topology ---------- */

function SlurmSteps() {
  return (
    <>
      <OpenPanelStep />

      <Step id="remote-topology" num="02" title="Choose a Connection Type">
        <p>
          Set <strong>Connection Topology</strong> to <strong>HPC via Slurm</strong>. This is the
          default, and the rest of this section covers that path.
        </p>
      </Step>

      <Step id="remote-fields" num="03" title="Enter the Connection Details">
        <table className="setup-table">
          <thead>
            <tr>
              <th>Setting</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>HPC Login Node</strong> / <strong>Remote Host</strong>
              </td>
              <td>
                <code>user@login-host</code>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Workspace Root</strong>
              </td>
              <td>
                <code>~/gardener_remote</code>, or use <strong>Browse</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <Figure
          src="/setup/11-hpc-drawer.webp"
          alt="HPC Connection drawer with login node and workspace root fields"
          caption="HPC Connection drawer"
          width={1600}
          height={930}
        />
        <p>
          Under <strong>Advanced Backend Slurm Resources</strong>: CPU Cores <code>16</code>, RAM{" "}
          <code>64</code> GB, Wall Time <code>24</code> h.
        </p>
        <Figure
          src="/setup/11-hpc-adv-setting.webp"
          alt="Advanced Backend Slurm Resources settings"
          caption="Advanced Slurm resources"
          width={1331}
          height={1600}
          size="sm"
        />
      </Step>

      <Step id="remote-access" num="04" title="Set Up SSH">
        <ol className="setup-ol">
          <li>
            <strong>Set Up SSH Key</strong> → enter your cluster password in the terminal that opens.
          </li>
          <li>
            <strong>Test SSH Connection</strong> → expect <code>Connected to &lt;host&gt;</code>.
          </li>
        </ol>
      </Step>

      <Step id="remote-storage" num="05" title="Check Storage">
        <p>
          <strong>Query Storage</strong> → confirm quota headroom if you want to check remote
          storage.
        </p>
      </Step>

      <Step id="remote-connect" num="06" title="Connect">
        <p>
          Click <strong>Connect to Remote Server</strong>. The first connection pulls two container
          images and is slow.
        </p>
        <Figure
          src="/setup/14-connecting.webp"
          alt="Connection progress while Gardener connects to the remote server"
          caption="Connection progress"
          width={1600}
          height={927}
        />
        <Note tone="warn">
          Before connecting to the remote server, be sure to connect to your organization&rsquo;s VPN.
        </Note>
      </Step>

      <Step id="remote-disconnect" num="07" title="Disconnect">
        <p>
          <strong>Close Remote HPC Process</strong> frees the Slurm allocation.{" "}
          <strong>Keep Remote HPC Process Running</strong> allows a fast reconnect.
        </p>
        <Figure
          src="/setup/16-disconnect.webp"
          alt="Disconnect dialog offering to close or keep the remote HPC process"
          caption="Disconnect dialog"
          width={1600}
          height={931}
        />
      </Step>
    </>
  );
}

function SshSteps() {
  return (
    <>
      <Step id="remote-prereq" num="00" title="What the Remote Host Needs">
        <table className="setup-table">
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SSH access on port 22</td>
              <td>Gardener drives everything over SSH</td>
            </tr>
            <tr>
              <td>
                <code>apptainer</code> or <code>singularity</code>
              </td>
              <td>
                The backend and sandbox run as <code>.sif</code> container images
              </td>
            </tr>
            <tr>
              <td>
                Network egress to <code>ghcr.io</code>
              </td>
              <td>Both images are pulled from GitHub Container Registry</td>
            </tr>
            <tr>
              <td>A writable workspace directory</td>
              <td>Images, logs, and results are stored there</td>
            </tr>
          </tbody>
        </table>
        <Note>
          On clusters where containers ship as a module, Gardener also tries{" "}
          <code>module load apptainer</code> / <code>module load singularity</code> before giving up.
        </Note>
      </Step>

      <OpenPanelStep />

      <Step id="remote-topology" num="02" title="Choose a Connection Type">
        <p>
          Set <strong>Connection Topology</strong> to <strong>Direct SSH</strong>.
        </p>
        <p>
          Each topology keeps its own saved settings, so switching back and forth does not overwrite
          your Slurm or Sphere configuration.
        </p>
      </Step>

      <Step id="remote-fields" num="03" title="Enter the Connection Details">
        <table className="setup-table">
          <thead>
            <tr>
              <th>Setting</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Remote Host</strong>
              </td>
              <td>
                <code>user@remote-host</code>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Workspace Root</strong>
              </td>
              <td>
                <code>~/gardener_remote</code>, or use <strong>Browse</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <Figure
          src="/setup/17-ssh-hpc-drawer.webp"
          alt="HPC Connection drawer with Direct SSH selected"
          caption="Direct SSH connection drawer"
          width={933}
          height={1600}
          size="md"
        />
        <Note>
          Use the same <code>user@remote-host</code> you would type in{" "}
          <code>ssh user@remote-host</code> to reach the server from a terminal.
        </Note>
        <Note>
          <strong>Advanced Backend Slurm Resources</strong> is hidden in this topology. There is no
          allocation to size. The backend runs as an ordinary process and uses whatever the host
          has.
        </Note>
      </Step>

      <Step id="remote-access" num="04" title="Set Up SSH">
        <ol className="setup-ol">
          <li>
            <strong>Set Up SSH Key</strong> → enter your server password in the terminal that opens.
          </li>
          <li>
            <strong>Test SSH Connection</strong> → expect <code>Connected to &lt;host&gt;</code>.
          </li>
        </ol>
      </Step>

      <Step id="remote-storage" num="05" title="Check Storage">
        <p>
          <strong>Query Storage</strong> → confirm quota headroom if you want to check remote
          storage.
        </p>
        <Note>
          This runs <code>checkquota</code>, which is an HPC tool. A plain server usually does not
          have it and reports <code>Remote host does not provide checkquota.</code> That is
          expected and does not block the connection. Check free space with <code>df -h</code>{" "}
          yourself instead.
        </Note>
      </Step>

      <Step id="remote-connect" num="06" title="Connect">
        <p>
          Click <strong>Connect to Remote Server</strong>. The first connection pulls two container
          images and is slow.
        </p>
        <Figure
          src="/setup/18-ssh-connect.webp"
          alt="Connection progress for a Direct SSH connection"
          caption="Connection progress"
          width={889}
          height={1600}
          size="md"
        />
        <Note tone="warn">
          If the host sits behind your organization&rsquo;s network, connect to the VPN before
          connecting.
        </Note>
      </Step>

      <Step id="remote-disconnect" num="07" title="Disconnect">
        <p>
          <strong>Close Remote HPC Process</strong> stops the backend and any running tasks on the
          server. <strong>Keep Remote HPC Process Running</strong> leaves it up, so the next
          connection reuses the running backend instead of pulling and starting everything again.
        </p>
        <Figure
          src="/setup/16-disconnect.webp"
          alt="Disconnect dialog offering to close or keep the remote HPC process"
          caption="Disconnect dialog"
          width={1600}
          height={931}
        />
      </Step>
    </>
  );
}

function SphereSteps() {
  return (
    <>
      <Step id="remote-prereq" num="00" title="Before You Start">
        <p>
          Unlike the other topologies, Gardener does not SSH straight to the target. It authenticates
          with <strong>MRG</strong> (the Merge portal CLI), then hops:
        </p>
        <CodeBlock>
          {`your laptop  →  jump.sphere-testbed.net  →  your XDC  →  compute node (actor)`}
        </CodeBlock>
        <table className="setup-table">
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A SPHERE account</td>
              <td>Username and password for the Merge portal</td>
            </tr>
            <tr>
              <td>A project and an XDC</td>
              <td>
                The XDC is named <code>projectid.username</code>
              </td>
            </tr>
            <tr>
              <td>
                The XDC <strong>attached to a materialization</strong>
              </td>
              <td>
                Gardener refuses to connect otherwise, so materialize and attach it from the portal
                first
              </td>
            </tr>
            <tr>
              <td>A compute node in that materialization</td>
              <td>
                Usually <code>actor1</code>
              </td>
            </tr>
            <tr>
              <td>The node prepared</td>
              <td>
                Data disk mounted, Apptainer installed. See{" "}
                <Link className="setup-inline-link" href={NODE_GUIDE}>
                  Preparing a SPHERE compute node
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
        <Note>
          You do <strong>not</strong> need to install MRG yourself. If <code>mrg</code> is not
          already on your <code>PATH</code>, Gardener downloads a pinned release into its own
          app-data folder on first use.
        </Note>

        <Link className="setup-crosslink" href={NODE_GUIDE}>
          <span className="setup-crosslink-eyebrow">Companion guide · do this first</span>
          <span className="setup-crosslink-title">Preparing a SPHERE Compute Node</span>
          <span className="setup-crosslink-desc">
            Reaching the node, mounting its data disk at <code>/data</code>, installing Apptainer
            and build tools, and SSH keys. Once per compute node, before you connect from Gardener.
          </span>
        </Link>
      </Step>

      <OpenPanelStep />

      <Step id="remote-topology" num="02" title="Choose a Connection Type">
        <p>
          Set <strong>Connection Topology</strong> to <strong>Sphere XDC</strong>.
        </p>
        <p>
          Each topology keeps its own saved settings, so switching back and forth does not overwrite
          your Slurm or Direct SSH configuration.
        </p>
      </Step>

      <Step id="remote-fields" num="03" title="Enter the Connection Details">
        <table className="setup-table">
          <thead>
            <tr>
              <th>Setting</th>
              <th>Value</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Sphere Server</strong>
              </td>
              <td>Merge portal gRPC endpoint</td>
              <td>
                <code>grpc.sphere-testbed.net</code>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Sphere Username</strong>
              </td>
              <td>
                Your SPHERE username, <a href="#finding-xdc">see below</a>
              </td>
              <td>—</td>
            </tr>
            <tr>
              <td>
                <strong>XDC</strong>
              </td>
              <td>
                <code>projectid.username</code>, <a href="#finding-xdc">see below</a>
              </td>
              <td>—</td>
            </tr>
            <tr>
              <td>
                <strong>Compute Node</strong>
              </td>
              <td>Node the backend runs on</td>
              <td>
                <code>actor1</code>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Compute Workspace Root</strong>
              </td>
              <td>
                Workspace on the compute node, or use <strong>Browse</strong>. Use{" "}
                <code>/data/gardener_remote</code> once the{" "}
                <Link className="setup-inline-link" href={`${NODE_GUIDE}#mount-data`}>
                  data disk is mounted
                </Link>
              </td>
              <td>
                <code>~/gardener_remote</code>
              </td>
            </tr>
            <tr>
              <td>
                <strong>XDC Control Directory</strong>
              </td>
              <td>Where Gardener keeps its control files on the XDC</td>
              <td>
                <code>~/.lotus-sphere-control</code>
              </td>
            </tr>
          </tbody>
        </table>
        <Note>
          The first four are required. <strong>Advanced Backend Slurm Resources</strong> is hidden in
          this topology. The backend runs directly on the compute node.
        </Note>

        <Sub id="finding-xdc">Finding Your XDC Name and Username</Sub>
        <p>
          Both are in the URL of your XDC&rsquo;s JupyterLab, the page SPHERE gives you once the XDC
          is set up. For example:
        </p>
        <CodeBlock>
          {`https://dewexp64518387-jiapengz.xdc.sphere-testbed.net/jupyter/user/jiapengz/crossomics/lab
        └──────────┬──────────┘                                     └──┬───┘
            XDC host label                                         username`}
        </CodeBlock>
        <table className="setup-table">
          <thead>
            <tr>
              <th>Setting</th>
              <th>How to read it off the URL</th>
              <th>In this example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Sphere Username</strong>
              </td>
              <td>
                The name under <code>/jupyter/user/</code>
              </td>
              <td>
                <code>jiapengz</code>
              </td>
            </tr>
            <tr>
              <td>
                <strong>XDC</strong>
              </td>
              <td>
                The host label before <code>.xdc.sphere-testbed.net</code>, with the hyphen in front
                of your username turned back into a dot
              </td>
              <td>
                <code>dewexp64518387.jiapengz</code>
              </td>
            </tr>
          </tbody>
        </table>
        <Note>
          URLs spell the XDC with a hyphen (<code>dewexp64518387-jiapengz</code>) because a dot would
          start a new domain level. The <strong>XDC</strong> field wants the dotted form,{" "}
          <code>dewexp64518387.jiapengz</code>.
        </Note>
        <Note>
          This URL identifies your <strong>XDC</strong>, not the compute node. The XDC is the access
          container Gardener hops <em>through</em>; <strong>Compute Node</strong> is a machine inside
          your materialization (<code>actor1</code> by default), which is where the backend actually
          runs.
        </Note>
      </Step>

      <Step id="remote-access" num="04" title="Set Up MRG Access">
        <ol className="setup-ol">
          <li>
            <strong>Set Up MRG Login</strong> → a terminal opens and runs{" "}
            <code>mrg login &lt;your-username&gt;</code>. Enter your SPHERE password there. Gardener
            waits up to 5 minutes for it to complete, then checks that your XDC is attached.
          </li>
          <li>
            <strong>Test Sphere Connection</strong> → expect a success message.
          </li>
        </ol>
        <p>
          This step points MRG at your server, logs you in, and writes the key Gardener uses for the
          whole hop chain to <code>~/.ssh/merge_key</code>.
        </p>
        <table className="setup-table">
          <thead>
            <tr>
              <th>If it fails</th>
              <th>Fix</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>MRG is installed but not logged in.</code>
              </td>
              <td>
                Re-run <strong>Set Up MRG Login</strong>, or run{" "}
                <code>mrg config set server &lt;server&gt; &amp;&amp; mrg login &lt;username&gt;</code>{" "}
                in a terminal yourself.
              </td>
            </tr>
            <tr>
              <td>
                <code>MRG is logged in, but &lt;xdc&gt; is not attached to a materialization.</code>
              </td>
              <td>
                Materialize your experiment and attach the XDC, then press{" "}
                <strong>Set Up MRG Login</strong> again.
              </td>
            </tr>
          </tbody>
        </table>
      </Step>

      <Step id="remote-storage" num="05" title="Check Storage">
        <p>
          <strong>Query Storage</strong> → reports free space via <code>df -h</code> on the compute
          node.
        </p>
        <Note>
          There is no quota output here, unlike the Slurm topology. SPHERE compute nodes report
          plain disk usage.
        </Note>
      </Step>

      <Step id="remote-connect" num="06" title="Connect">
        <p>
          Click <strong>Connect to Remote Server</strong>. The first connection pulls two container
          images and is slow, since every byte crosses the jump host.
        </p>
        <Figure
          src="/setup/14-connecting.webp"
          alt="Connection progress while Gardener connects to the remote server"
          caption="Connection progress"
          width={1600}
          height={927}
        />
        <Note>
          The compute node needs <code>apptainer</code> (or <code>singularity</code>) and network
          egress to <code>ghcr.io</code> for the image pull to succeed. See{" "}
          <Link className="setup-inline-link" href={`${NODE_GUIDE}#install-apptainer`}>
            Install Apptainer
          </Link>{" "}
          if this step fails.
        </Note>
      </Step>

      <Step id="remote-disconnect" num="07" title="Disconnect">
        <p>
          <strong>Close Remote HPC Process</strong> stops the backend and any running tasks on the
          compute node. <strong>Keep Remote HPC Process Running</strong> leaves it up for a fast
          reconnect.
        </p>
        <Figure
          src="/setup/16-disconnect.webp"
          alt="Disconnect dialog offering to close or keep the remote HPC process"
          caption="Disconnect dialog"
          width={1600}
          height={931}
        />
      </Step>
    </>
  );
}

export default function PartRemote({
  topology,
  onChange
}: {
  topology: TopologyKey;
  onChange: (k: TopologyKey) => void;
}) {
  return (
    <section className="setup-part" id="part-remote">
      <PartHead num="PART II" title="Connect a Remote Machine">
        Required for the heavy compute that cannot run locally on macOS or Windows. Finish
        Part&nbsp;I first, then pick the connection that matches your machine. The steps below change
        to suit it.
      </PartHead>

      <Chooser value={topology} onChange={onChange} />

      {topology === "slurm" && <SlurmSteps />}
      {topology === "ssh" && <SshSteps />}
      {topology === "sphere" && <SphereSteps />}
    </section>
  );
}
