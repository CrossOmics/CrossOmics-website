import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import SetupIndex from "../SetupIndex";
import { Arrow, CodeBlock, Note, Step, Sub } from "../parts";

export const metadata: Metadata = {
  title: "Preparing a SPHERE Compute Node — Gardener | CrossOmics",
  description:
    "Node-side setup for SPHERE: reaching the node, mounting its data disk at /data, installing Apptainer and build tools, and SSH key access."
};

const INDEX = [
  {
    title: "Node Preparation",
    sectionId: "node-steps",
    items: [
      { id: "reach-node", label: "01  Reach Your Node" },
      { id: "mount-data", label: "02  Mount the Disk" },
      { id: "install-apptainer", label: "03  Apptainer" },
      { id: "build-tools", label: "04  Build Tools" },
      { id: "ssh-keys", label: "05  SSH Keys" }
    ]
  }
];

const MODEL_EXAMPLE = `from mergexp import *

# Topology object. addressing/routing let Merge auto-assign IPv4 addresses
# and configure static routes. A single-node experiment does not actually use
# either constraint, but keeping them makes it easy to add nodes later.
net = Network('bignode', addressing == ipv4, routing == static)

# Main node: >= 84 cores, >= 192 GB RAM, plus an extra 512 GB data disk.
#
#   proc.cores       CPU cores, default 1
#   memory.capacity  RAM in bytes — use gb() to convert, default 512 MB
#   disk.capacity    extra disk, attached to the node as /dev/vdb
#                    (the root partition is fixed at 32 GB and unaffected)
#   image            OS image, default bullseye (Debian)
#   metal            True = bare metal, False = virtual machine (default False)
actor1 = net.node(
    'actor1',
    proc.cores >= 84,
    memory.capacity >= gb(192),
    disk.capacity == gb(512),
    image == '2404',        # check which image names SPHERE currently supports first
    # metal == True,        # enable when you need bare metal — expect a much longer wait for resources
)

# ---------------------------------------------------------------------------
# Multi-node variant: if the single-node model fails to compile, or you need
# a worker anyway, uncomment the lines below. capacity on the link is
# optional — leave it off unless you need rate limiting, since link
# constraints add emulation overhead.
# ---------------------------------------------------------------------------
# n1 = net.node(
#     'n1',
#     proc.cores >= 4,
#     memory.capacity >= gb(8),
# )
# link = net.connect([actor1, n1])
# link[actor1].socket.addrs = ip4('10.0.0.1/24')
# link[n1].socket.addrs = ip4('10.0.0.2/24')

# The model file must end with this line — without it, compilation always fails
experiment(net)`;

const MOUNT_SCRIPT = `#!/usr/bin/env bash
set -euo pipefail

DISK=/dev/vdb
MOUNT=/data

echo "== 1) Checking whether $DISK already has a filesystem =="
sudo file -s "$DISK"
FSTYPE=$(sudo blkid -o value -s TYPE "$DISK" || true)

if [ -z "$FSTYPE" ]; then
  echo "== 2) $DISK is empty, formatting as ext4 =="
  sudo mkfs.ext4 "$DISK"
else
  echo "== 2) $DISK already has a filesystem ($FSTYPE), skipping format to protect data =="
fi

echo "== 3) Mounting at $MOUNT =="
sudo mkdir -p "$MOUNT"
mountpoint -q "$MOUNT" || sudo mount "$DISK" "$MOUNT"
sudo chown -R "$USER":"$USER" "$MOUNT"
df -h "$MOUNT"

echo "== 4) Adding to /etc/fstab for a persistent mount (idempotent, no vim needed) =="
UUID=$(sudo blkid -o value -s UUID "$DISK")
echo "UUID = $UUID"
sudo cp -n /etc/fstab /etc/fstab.bak.$(date +%Y%m%d%H%M%S) || true
if grep -qE "[[:space:]]\${MOUNT}[[:space:]]" /etc/fstab; then
  echo "fstab already has a $MOUNT entry, skipping append"
else
  echo "UUID=\${UUID} \${MOUNT} ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
fi

echo "== 5) Verifying the fstab entry =="
sudo mount -a
df -h "$MOUNT"
echo "== ✅ Done. BioAgent data, models, and Docker can now live in $MOUNT =="`;

export default function SphereNodePage() {
  return (
    <PageShell
      title="Node Prep"
      subtitle="Preparing a SPHERE Compute Node"
      breadcrumb={[
        { label: "Tutorial", href: "/tutorial" },
        { label: "Setup", href: "/tutorial/setup" },
        { label: "Node Prep" }
      ]}
    >
      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">00 / SCOPE</div>
          <h2 className="section-title">The Node Side of SPHERE</h2>
        </div>
        <div className="section-body">
          <p>
            Node-side setup for SPHERE: reaching the node, mounting its data disk, and installing
            what Gardener&rsquo;s backend needs.
          </p>
          <p>
            This is the companion to the{" "}
            <Link className="setup-inline-link" href="/tutorial/setup#remote-panel">
              Sphere XDC topology
            </Link>{" "}
            in the setup guide, which covers the app side, meaning what to type into the connection panel.
            Do the steps here <strong>once per compute node</strong>, before you connect from
            Gardener.
          </p>
          <p className="setup-cta-row">
            <Link className="cta-link" href="/tutorial/setup#remote-panel">
              Back to the setup guide <Arrow />
            </Link>
          </p>
        </div>
      </Reveal>

      <div className="setup-layout">
        <SetupIndex groups={INDEX} />

        <div className="setup-content">
          <section className="setup-part" id="node-steps">
            <Step id="reach-node" num="01" title="Reach Your Node">
              <Sub>Where the Node Comes From</Sub>
              <p>
                Compute nodes are not picked from a list — they are declared. A SPHERE experiment
                starts as a <strong>model</strong>: a short Python file, written in the Merge
                portal&rsquo;s <strong>Model Editor</strong>, that describes the nodes you want and
                the resources each one must have. When you <strong>materialize</strong> the model,
                SPHERE reserves real machines that satisfy those constraints and provisions them;
                attaching your XDC to the materialization is what puts them within reach. The node
                name used throughout this page — <code>actor1</code> — is simply the name the model
                gives its node.
              </p>
              <p>
                An example model for a single large Gardener node, including the extra data disk
                that <a href="#mount-data">step 02</a> mounts:
              </p>
              <CodeBlock>{MODEL_EXAMPLE}</CodeBlock>

              <p>Once the materialization is up, there are two ways in. Both land on the same machine.</p>

              <Sub>Browser</Sub>
              <p>Your XDC&rsquo;s JupyterLab:</p>
              <CodeBlock>
                {`https://dewexp64518387-jiapengz.xdc.sphere-testbed.net/jupyter/user/jiapengz/crossomics/lab`}
              </CodeBlock>

              <Sub>Local Terminal</Sub>
              <p>Hop through the XDC, then into the compute node:</p>
              <CodeBlock>
                {`mrg xdc ssh dewexp64518387.jiapengz
ssh actor1`}
              </CodeBlock>

              <p>Substitute your own values throughout this page:</p>
              <table className="setup-table">
                <thead>
                  <tr>
                    <th>Placeholder</th>
                    <th>This example</th>
                    <th>Where it comes from</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>XDC</td>
                    <td>
                      <code>dewexp64518387.jiapengz</code>
                    </td>
                    <td>Your JupyterLab host label, hyphen → dot</td>
                  </tr>
                  <tr>
                    <td>Username</td>
                    <td>
                      <code>jiapengz</code>
                    </td>
                    <td>
                      The name under <code>/jupyter/user/</code>
                    </td>
                  </tr>
                  <tr>
                    <td>Compute node</td>
                    <td>
                      <code>actor1</code>
                    </td>
                    <td>The node name declared in your model</td>
                  </tr>
                </tbody>
              </table>
              <Note>
                The URL writes the XDC with a hyphen (<code>dewexp64518387-jiapengz</code>);{" "}
                <code>mrg</code> and Gardener&rsquo;s <strong>XDC</strong> field want the dotted form
                (<code>dewexp64518387.jiapengz</code>).
              </Note>
            </Step>

            <Step id="mount-data" num="02" title="Mount the Data Disk at /data">
              <p>
                SPHERE nodes ship with a second, unmounted disk. Gardener&rsquo;s default Sphere
                workspace is <code>/data/gardener_remote</code>, so mounting it is what makes that
                default work. It is also where you want container images, datasets, and results to
                live rather than on the small root filesystem.
              </p>

              <Note tone="danger">
                <strong>This script formats a disk.</strong> <code>mkfs.ext4</code> destroys
                everything on the target. It skips formatting when it finds an existing filesystem,
                but confirm the device is the empty data disk before running it. Check with{" "}
                <code>lsblk -f</code>, and adjust <code>DISK=</code> if your data disk is not{" "}
                <code>/dev/vdb</code>.
              </Note>

              <CodeBlock>{MOUNT_SCRIPT}</CodeBlock>

              <p>
                The script is idempotent, so re-running it will not reformat a mounted disk, and the{" "}
                <code>fstab</code> entry makes the mount survive a reboot.
              </p>
              <Note tone="warn">
                <strong>If you skip this step</strong>, <code>/data</code> will not exist. Set{" "}
                <strong>Compute Workspace Root</strong> to a path in your home directory instead
                (e.g. <code>~/gardener_remote</code>) and expect less room for images and results.
              </Note>
            </Step>

            <Step id="install-apptainer" num="03" title="Install Apptainer">
              <p>
                Gardener runs its backend and sandbox as <code>.sif</code> container images. Without
                a container runtime on the node, the connection fails during the image pull.
              </p>
              <Note tone="warn">
                These commands are for <strong>Ubuntu</strong> only — the PPA and{" "}
                <code>add-apt-repository</code> do not exist on other distributions. Elsewhere,
                follow the{" "}
                <a
                  className="setup-inline-link"
                  href="https://apptainer.org/docs/admin/main/installation.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  official Apptainer installation guide
                </a>{" "}
                instead.
              </Note>
              <CodeBlock>
                {`sudo add-apt-repository -y ppa:apptainer/ppa
sudo apt update
sudo apt install -y apptainer`}
              </CodeBlock>
              <p>Verify:</p>
              <CodeBlock>{`apptainer --version`}</CodeBlock>
              <Note>
                <code>singularity</code> works too. Gardener looks for either, and also tries{" "}
                <code>module load apptainer</code> / <code>module load singularity</code> on nodes
                where containers ship as a module.
              </Note>
            </Step>

            <Step id="build-tools" num="04" title="Install Build Tools">
              <p className="setup-optional">Optional</p>
              <p>
                Only needed when running the backend <strong>from source</strong> (
                <code>npm run start</code>). The shipped app pulls prebuilt images and does not
                compile anything on the node.
              </p>
              <p>
                <code>hnswlib</code> builds native code and needs a C++11 toolchain, so environment
                initialization fails without one.
              </p>

              <Sub>Ubuntu / Debian</Sub>
              <CodeBlock>
                {`sudo apt-get update && sudo apt-get install -y build-essential`}
              </CodeBlock>

              <Sub>RHEL / Rocky / CentOS</Sub>
              <CodeBlock>{`sudo yum groupinstall -y "Development Tools"`}</CodeBlock>
            </Step>

            <Step id="ssh-keys" num="05" title="SSH Key Access">
              <Note>
                Gardener&rsquo;s <strong>Sphere XDC</strong> topology does not need this. It
                authenticates through MRG and uses <code>~/.ssh/merge_key</code> for the whole hop
                chain. Set this up when you want plain <code>ssh</code> access to the node from your
                own terminal, or when pointing the <strong>Direct SSH</strong> topology at it.
              </Note>

              <Sub>From Your Local Machine</Sub>
              <CodeBlock>{`ssh-copy-id jiapengz@dewexp07690701`}</CodeBlock>
              <p>
                The part after <code>@</code> differs per node. Take it from the connection details
                shown for your node.
              </p>

              <Sub>Or Add the Key Manually on the Node</Sub>
              <CodeBlock>
                {`mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "ssh-public-key" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`}
              </CodeBlock>
              <p>With an editor instead:</p>
              <CodeBlock>
                {`mkdir -p ~/.ssh && chmod 700 ~/.ssh
vim ~/.ssh/authorized_keys      # paste the whole public key line, then :wq
chmod 600 ~/.ssh/authorized_keys`}
              </CodeBlock>
              <p>
                The permissions matter: <code>700</code> on <code>~/.ssh</code> and{" "}
                <code>600</code> on <code>authorized_keys</code>. SSH refuses keys on more permissive
                files.
              </p>
            </Step>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
