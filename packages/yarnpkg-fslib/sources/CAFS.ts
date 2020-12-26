import {getFilePathByModeInCafs, PackageFilesIndex} from '@pnpm/cafs'
import fs, {constants, Stats, WriteStream} from 'fs';
import path from 'path'
import {BasePortableFakeFS, CreateReadStreamOptions, CreateWriteStreamOptions, Dir, FakeFS, MkdirOptions, RmdirOptions, SymlinkType, WriteFileOptions, OpendirOptions, WatchFileOptions, WatchFileCallback, StatWatcher, WatchCallback, WatchOptions, Watcher} from './FakeFS';
import {Filename, FSPath, PortablePath, npath} from './path';
import * as statUtils                                                                                                                                from './statUtils';
import * as errors from './errors'
import { NodeFS } from './NodeFS'

export class CAFS extends BasePortableFakeFS {
  private _pkgIndexes: Map<string, PackageFilesIndex> = new Map()
  private _storeDir: string
  private readonly baseFs: FakeFS<PortablePath>;
  private readonly realFs: typeof fs;

  constructor(realFs: typeof fs = fs) {
    super();

    this.realFs = realFs;
    this.baseFs = new NodeFS()
    this._storeDir = '/home/zoltan/.pnpm-store/v3'
  }

  private _readPkgInfo(p: PortablePath) {
    let [indexFile, subPath] = p.split('-index.json/$$virtual/')
    indexFile += '-index.json'
    subPath = subPath.substring(subPath.indexOf('/'))

    let index!: PackageFilesIndex;
    if (!this._pkgIndexes.has(indexFile)) {
      index = JSON.parse(fs.readFileSync(path.join(this._storeDir, indexFile), 'utf8'))
      this._pkgIndexes.set(indexFile, index)
    } else {
      index = this._pkgIndexes.get(indexFile)!
    }
    return { index, subPath }
  }

  private _resolvePath(p: PortablePath) {
    const { index, subPath } = this._readPkgInfo(p)
    const fileInfo = index.files[subPath]
    return getFilePathByModeInCafs(this._storeDir, fileInfo.integrity, fileInfo.mode)
  }

  async accessPromise(p: PortablePath, mode?: number) {
    return this.accessSync(p, mode);
  }

  accessSync(p: PortablePath, mode: number = constants.F_OK) {
    return fs.accessSync(this._resolvePath(p), mode)
  }

  async chmodPromise(p: PortablePath, mask: number) {
  }

  chmodSync(p: PortablePath, mask: number) {
  }

  async chownPromise(p: PortablePath, uid: number, gid: number) {
  }

  chownSync(p: PortablePath, uid: number, gid: number) {
  }

  async renamePromise(oldP: PortablePath, newP: PortablePath) {
  }

  renameSync(oldP: PortablePath, newP: PortablePath) {
  }

  async copyFilePromise(sourceP: PortablePath, destP: PortablePath, flags: number = 0) {
  }

  copyFileSync(sourceP: PortablePath, destP: PortablePath, flags: number = 0) {
  }

  async appendFilePromise(p: FSPath<PortablePath>, content: string | Buffer | ArrayBuffer | DataView, opts?: WriteFileOptions) {
  }

  appendFileSync(p: FSPath<PortablePath>, content: string | Buffer | ArrayBuffer | DataView, opts?: WriteFileOptions) {
  }

  async writeFilePromise(p: FSPath<PortablePath>, content: string | Buffer | ArrayBuffer | DataView, opts?: WriteFileOptions) {
  }

  writeFileSync(p: FSPath<PortablePath>, content: string | Buffer | ArrayBuffer | DataView, opts?: WriteFileOptions) {
  }

  async unlinkPromise(p: PortablePath) {
  }

  unlinkSync(p: PortablePath) {
  }

  async utimesPromise(p: PortablePath, atime: Date | string | number, mtime: Date | string | number) {
  }

  utimesSync(p: PortablePath, atime: Date | string | number, mtime: Date | string | number) {
  }

  async mkdirPromise(p: PortablePath, opts?: MkdirOptions) {
  }

  mkdirSync(p: PortablePath, opts?: MkdirOptions) {
  }

  async rmdirPromise(p: PortablePath, opts?: RmdirOptions) {
  }

  rmdirSync(p: PortablePath, opts?: RmdirOptions) {
  }

  async linkPromise(existingP: PortablePath, newP: PortablePath) {
  }

  linkSync(existingP: PortablePath, newP: PortablePath) {
  }

  async symlinkPromise(target: PortablePath, p: PortablePath, type?: SymlinkType) {
  }

  symlinkSync(target: PortablePath, p: PortablePath, type?: SymlinkType) {
  }

  readFilePromise(p: FSPath<PortablePath>, encoding: 'utf8'): Promise<string>;
  readFilePromise(p: FSPath<PortablePath>, encoding?: string): Promise<Buffer>;
  async readFilePromise(p: FSPath<PortablePath>, encoding?: string) {
    const pathInCafs = typeof p === 'number' ? p : (this._resolvePath(p) as FSPath<PortablePath>)
    // This weird switch is required to tell TypeScript that the signatures are proper (otherwise it thinks that only the generic one is covered)
    switch (encoding) {
      case `utf8`:
        return await this.baseFs.readFilePromise(pathInCafs, encoding);
      default:
        return await this.baseFs.readFilePromise(pathInCafs, encoding);
    }
  }

  readFileSync(p: FSPath<PortablePath>, encoding: 'utf8'): string;
  readFileSync(p: FSPath<PortablePath>, encoding?: string): Buffer;
  readFileSync(p: FSPath<PortablePath>, encoding?: string) {
    const pathInCafs = typeof p === 'number' ? p : (this._resolvePath(p) as FSPath<PortablePath>)
    // This weird switch is required to tell TypeScript that the signatures are proper (otherwise it thinks that only the generic one is covered)
    switch (encoding) {
      case `utf8`:
        return this.baseFs.readFileSync(pathInCafs, encoding);
      default:
        return this.baseFs.readFileSync(pathInCafs, encoding);
    }
  }

  async readdirPromise(p: PortablePath): Promise<Array<Filename>>;
  async readdirPromise(p: PortablePath, opts: {withFileTypes: false}): Promise<Array<Filename>>;
  async readdirPromise(p: PortablePath, opts: {withFileTypes: true}): Promise<Array<statUtils.DirEntry>>;
  async readdirPromise(p: PortablePath, opts: {withFileTypes: boolean}): Promise<Array<Filename> | Array<statUtils.DirEntry>>;
  async readdirPromise(p: PortablePath, {withFileTypes}: {withFileTypes?: boolean} = {}): Promise<Array<string> | Array<statUtils.DirEntry>> {
    return []
    // const { index, subPath } = this._readPkgInfo(p)
    // if (withFileTypes) {
      // const dirs: string[] = []
      // for (const filePath in Object.keys(index.files)) {
        // if (filePath.startsWith(`${subPath}/`) {
          // const parts = filePath.substring(subPath.length + 1).split('/')
          // dirs.push(filePath.split('/')[1])
        // }
      // }
      // return dirs
    // }
    // const dirs: statUtils.DirEntry[] = []
    // for (const filePath in Object.keys(index.files)) {
      // if (filePath.startsWith(`${subPath}/`)) {
        // const parts = filePath.split('/')
        // if (parts
        // dirs.push(filePath.split('/')[1])
      // }
    // }
  }

  readdirSync(p: PortablePath): Array<Filename>;
  readdirSync(p: PortablePath, opts: {withFileTypes: false}): Array<Filename>;
  readdirSync(p: PortablePath, opts: {withFileTypes: true}): Array<statUtils.DirEntry>;
  readdirSync(p: PortablePath, opts: {withFileTypes: boolean}): Array<Filename> | Array<statUtils.DirEntry>;
  readdirSync(p: PortablePath, {withFileTypes}: {withFileTypes?: boolean} = {}): Array<string> | Array<statUtils.DirEntry> {
    return []
    // return this.makeCallSync(p, () => {
      // return this.baseFs.readdirSync(p, {withFileTypes: withFileTypes as any});
    // }, (zipFs, {subPath}) => {
      // return zipFs.readdirSync(subPath, {withFileTypes: withFileTypes as any});
    // }, {
      // requireSubpath: false,
    // });
  }

  async closePromise(fd: number) {
    await new Promise<void>((resolve, reject) => {
      this.realFs.close(fd, this.makeCallback(resolve, reject));
    });
  }

  closeSync(fd: number) {
    this.realFs.closeSync(fd);
  }

  private makeCallback<T>(resolve: (value: T) => void, reject: (reject: NodeJS.ErrnoException) => void) {
    return (err: NodeJS.ErrnoException | null, result: T) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    };
  }

  async openPromise(p: PortablePath, flags: string, mode?: number) {
    return await new Promise<number>((resolve, reject) => {
      this.realFs.open(this._resolvePath(p), flags, mode, this.makeCallback(resolve, reject));
    });
  }

  openSync(p: PortablePath, flags: string, mode?: number) {
    return this.realFs.openSync(this._resolvePath(p), flags, mode);
  }

  createReadStream(p: PortablePath | null, opts?: CreateReadStreamOptions) {
    const realPath = (p !== null ? this._resolvePath(p) : p) as fs.PathLike;
    return this.realFs.createReadStream(realPath, opts);
  }

  createWriteStream(p: PortablePath | null, {encoding}: CreateWriteStreamOptions = {}): WriteStream {
    throw errors.EROFS(`open '${p}'`);
  }

  async realpathPromise(p: PortablePath) {
    return npath.toPortablePath(this._resolvePath(p));
  }

  realpathSync(p: PortablePath): PortablePath {
    return npath.toPortablePath(this._resolvePath(p));
  }

  async existsPromise(p: PortablePath) {
    return this.existsSync(p);
  }

  existsSync(p: PortablePath): boolean {
    const {index, subPath} = this._readPkgInfo(p);
    return Boolean(index.files[subPath])
  }

  getRealPath() {
    return '' as PortablePath
  }

  getExtractHint() {
    return false;
  }

  async opendirPromise(p: PortablePath, opts?: OpendirOptions): Promise<Dir<PortablePath>> {
    throw new Error()
  }

  opendirSync(p: PortablePath, opts?: OpendirOptions): Dir<PortablePath> {
    throw new Error()
  }

  async readPromise(fd: number, buffer: Buffer, offset: number = 0, length: number = 0, position: number | null = -1) {
    return await new Promise<number>((resolve, reject) => {
      this.realFs.read(fd, buffer, offset, length, position, (error, bytesRead) => {
        if (error) {
          reject(error);
        } else {
          resolve(bytesRead);
        }
      });
    });
  }

  readSync(fd: number, buffer: Buffer, offset: number, length: number, position: number) {
    return this.realFs.readSync(fd, buffer, offset, length, position);
  }

  async readlinkPromise(p: PortablePath): Promise<PortablePath> {
    throw new Error()
  }

  readlinkSync(p: PortablePath): PortablePath {
    throw new Error()
  }

  async lstatPromise(p: PortablePath) {
    return await new Promise<Stats>((resolve, reject) => {
      this.realFs.lstat(this._resolvePath(p), this.makeCallback(resolve, reject));
    });
  }

  lstatSync(p: PortablePath) {
    return this.realFs.lstatSync(this._resolvePath(p));
  }

  async statPromise(p: PortablePath) {
    return await new Promise<Stats>((resolve, reject) => {
      this.realFs.stat(this._resolvePath(p), this.makeCallback(resolve, reject));
    });
  }

  statSync(p: PortablePath) {
    return this.realFs.statSync(this._resolvePath(p));
  }

  async truncatePromise(p: PortablePath, len?: number) {
    throw new Error()
  }

  truncateSync(p: PortablePath, len?: number) {
    throw new Error()
  }

  watch(p: PortablePath, cb?: WatchCallback): Watcher;
  watch(p: PortablePath, opts: WatchOptions, cb?: WatchCallback): Watcher;
  watch(p: PortablePath, a?: WatchOptions | WatchCallback, b?: WatchCallback): Watcher {
    throw new Error()
  }

  watchFile(p: PortablePath, cb: WatchFileCallback): StatWatcher;
  watchFile(p: PortablePath, opts: WatchFileOptions, cb: WatchFileCallback): StatWatcher;
  watchFile(p: PortablePath, a: WatchFileOptions | WatchFileCallback, b?: WatchFileCallback): StatWatcher {
    throw new Error()
  }

  unwatchFile(p: PortablePath, cb?: WatchFileCallback) {
    throw new Error()
  }

  writePromise(fd: number, buffer: Buffer, offset?: number, length?: number, position?: number): Promise<number>;
  writePromise(fd: number, buffer: string, position?: number): Promise<number>;
  async writePromise(fd: number, buffer: Buffer | string, offset?: number, length?: number, position?: number): Promise<number> {
    throw new Error()
  }

  writeSync(fd: number, buffer: Buffer, offset?: number, length?: number, position?: number): number;
  writeSync(fd: number, buffer: string, position?: number): number;
  writeSync(fd: number, buffer: Buffer | string, offset?: number, length?: number, position?: number): number {
    throw new Error()
  }

  resolve(p: PortablePath) {
    return this._resolvePath(p) as PortablePath;
    // return ppath.resolve(p);
  }
}
