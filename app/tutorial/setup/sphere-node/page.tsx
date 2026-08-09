import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import SetupIndex from "../SetupIndex";
import { Arrow, Note, Step, Sub } from "../parts";

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
      { id: "ssh-keys", label: "05  SSH Keys" },
      { id: "troubleshooting", label: "Troubleshooting" }
    ]
  }
];

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
      title="NODE PREP"
      subtitle="Preparing a SPHERE Compute Node"
      breadcrumb={[
        { label: "Tutorial", href: "/tutorial" },
        { label: "Setup", href: "/tutorial/setup" },
        { label: "Node Prep" }
      ]}
      backgroundImage="/bg2.png"
    >
      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">00 / SCOPE</div>
          <h2 className="section-title">The Node Side of Sphere</h2>
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
            in the setup guide, which covers the app side — what to type into the connection panel.
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
              <p>Two ways in. Both land on the same machine.</p>

              <Sub>Browser</Sub>
              <p>Your XDC&rsquo;s JupyterLab:</p>
              <pre className="code-block">
                {`https://dewexp64518387-jiapengz.xdc.sphere-testbed.net/jupyter/user/jiapengz/crossomics/lab`}
              </pre>

              <Sub>Local Terminal</Sub>
              <p>Hop through the XDC, then into the compute node:</p>
              <pre className="code-block">
                {`mrg xdc ssh dewexp64518387.jiapengz
ssh actor1`}
              </pre>

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
                    <td>A node in your materialization</td>
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
                default work — and it is where you want container images, datasets, and results to
                live rather than on the small root filesystem.
              </p>

              <Note tone="danger">
                <strong>This script formats a disk.</strong> <code>mkfs.ext4</code> destroys
                everything on the target. It skips formatting when it finds an existing filesystem,
                but confirm the device is the empty data disk before running it — check with{" "}
                <code>lsblk -f</code>, and adjust <code>DISK=</code> if your data disk is not{" "}
                <code>/dev/vdb</code>.
              </Note>

              <pre className="code-block">{MOUNT_SCRIPT}</pre>

              <p>
                The script is idempotent — re-running it will not reformat a mounted disk — and the{" "}
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
              <pre className="code-block">
                {`sudo add-apt-repository -y ppa:apptainer/ppa
sudo apt update
sudo apt install -y apptainer`}
              </pre>
              <p>Verify:</p>
              <pre className="code-block">{`apptainer --version`}</pre>
              <Note>
                <code>singularity</code> works too — Gardener looks for either, and also tries{" "}
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
              <pre className="code-block">
                {`sudo apt-get update && sudo apt-get install -y build-essential`}
              </pre>

              <Sub>RHEL / Rocky / CentOS</Sub>
              <pre className="code-block">{`sudo yum groupinstall -y "Development Tools"`}</pre>
            </Step>

            <Step id="ssh-keys" num="05" title="SSH Key Access">
              <Note>
                Gardener&rsquo;s <strong>Sphere XDC</strong> topology does not need this — it
                authenticates through MRG and uses <code>~/.ssh/merge_key</code> for the whole hop
                chain. Set this up when you want plain <code>ssh</code> access to the node from your
                own terminal, or when pointing the <strong>Direct SSH</strong> topology at it.
              </Note>

              <Sub>From Your Local Machine</Sub>
              <pre className="code-block">{`ssh-copy-id jiapengz@dewexp07690701`}</pre>
              <p>
                The part after <code>@</code> differs per node — take it from the connection details
                shown for your node.
              </p>

              <Sub>Or Add the Key Manually on the Node</Sub>
              <pre className="code-block">
                {`mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "ssh-public-key" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`}
              </pre>
              <p>With an editor instead:</p>
              <pre className="code-block">
                {`mkdir -p ~/.ssh && chmod 700 ~/.ssh
vim ~/.ssh/authorized_keys      # paste the whole public key line, then :wq
chmod 600 ~/.ssh/authorized_keys`}
              </pre>
              <p>
                The permissions matter — <code>700</code> on <code>~/.ssh</code> and{" "}
                <code>600</code> on <code>authorized_keys</code>. SSH refuses keys on more permissive
                files.
              </p>
            </Step>

            <Step id="troubleshooting" num="—" title="Troubleshooting">
              <table className="setup-table">
                <thead>
                  <tr>
                    <th>Symptom</th>
                    <th>Fix</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Connection fails while pulling container images</td>
                    <td>
                      <a className="setup-inline-link" href="#install-apptainer">
                        Install Apptainer
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>npm run start</code> fails initializing the environment,{" "}
                      <code>hnswlib</code> compile errors
                    </td>
                    <td>
                      <a className="setup-inline-link" href="#build-tools">
                        Install build tools
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Workspace root is unwritable, or <code>/data</code> does not exist
                    </td>
                    <td>
                      <a className="setup-inline-link" href="#mount-data">
                        Mount the data disk
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Out of disk space on the node</td>
                    <td>
                      Check <code>df -h /data</code> — results may be landing on the root filesystem
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>Permission denied (publickey)</code> over plain SSH
                    </td>
                    <td>
                      <a className="setup-inline-link" href="#ssh-keys">
                        SSH key access
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                For failures in the app&rsquo;s connection panel itself — MRG login, XDC attachment —
                see the{" "}
                <Link className="setup-inline-link" href="/tutorial/setup#remote-access">
                  Sphere XDC topology
                </Link>{" "}
                in the setup guide.
              </p>
            </Step>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
