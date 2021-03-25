import execa from 'execa'
import { yarn } from '@cyn/utils'

function installPackages(
  packages: string[] = [],
  cwd: string = process.cwd(),
  dev = false,
) {
  const args = []

  args.push(yarn)

  if (packages.length > 0) {
    args.push('add')
    if (dev) {
      args.push('-D');
    }

    packages.forEach((pkg: string) => {
      args.push(pkg)
    })
  }

  return execa('node', args, {
    cwd
  });
}

export default installPackages;
