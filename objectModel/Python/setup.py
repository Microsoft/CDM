# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for license information.

import os
import distutils.cmd
import distutils.log
from shutil import copystat, ignore_patterns, rmtree, copy2
from typing import List, Optional

import setuptools

ROOT_PATH = os.path.dirname(os.path.abspath(__file__))
PACKAGE_NAME = 'cdm'
RESOURCES_FOLDER_NAME = 'resources'
LOG_MESSAGES_FOLDER_NAME = 'resx'
RESOURCES_PATH = os.path.join(ROOT_PATH, PACKAGE_NAME, RESOURCES_FOLDER_NAME)

with open('README.md', 'r') as readme_file:
    long_description = readme_file.read()

with open('requirements.txt') as requirements_file:
    requirements = [package.strip() for package in requirements_file.readlines()]


class CopyResourcesCommand(distutils.cmd.Command):
    """A command which is copying the resources from SchemaDocuments."""

    description = 'Copy resources from schema documents into this project.'  # type: Optional[str]

    user_options = []  # type: List[str]

    def copy_files(self, from_path, to_path, paths_to_ignore):
        """Non-recursively copies files from the source folder to destination folder."""

        names = os.listdir(from_path)

        ignored_names = paths_to_ignore(from_path, names)

        os.makedirs(to_path)

        for name in names:
            if name in ignored_names:
                continue
            srcname = os.path.join(from_path, name)
            dstname = os.path.join(to_path, name)
            if os.path.isfile(srcname):
                copy2(srcname, dstname)

        copystat(from_path, to_path)

    def copy_and_overwrite(self, from_path, to_path, paths_to_ignore):
        """Copies the folder from path and overwrites the to path folder."""
        self.copy_files(from_path, to_path, ignore_patterns(*paths_to_ignore))

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        print('Copying files from schema documents....')

        paths_to_ignore = ['*.manifest.cdm.json', '*.0.6.cdm.json', '*.0.7.cdm.json', '*.0.8.cdm.json', '*.0.8.1.cdm.json',
                           '*.0.9.cdm.json', '*.git*', '*.jpg', '*.md']

        paths_to_copy = ['.', 'cdmfoundation', 'extensions']

        if os.path.exists(RESOURCES_PATH):
            rmtree(RESOURCES_PATH)

        for path in paths_to_copy:
            from_path = os.path.abspath(os.path.join(ROOT_PATH, '..', '..', 'schemaDocuments', path))
            to_path = os.path.abspath(os.path.join(RESOURCES_PATH, path))
            self.copy_and_overwrite(from_path, to_path, paths_to_ignore)


setuptools.setup(
    name='commondatamodel-objectmodel',
    version='1.2.1-b.3',
    author='Microsoft',
    description='Common Data Model Object Model library for Python',
    url='https://github.com/microsoft/CDM/tree/master/objectModel/Python',
    install_requires=requirements,
    packages=setuptools.find_packages(),
    package_data={
        PACKAGE_NAME:[
            os.path.join(LOG_MESSAGES_FOLDER_NAME, '*'),
            os.path.join(RESOURCES_FOLDER_NAME, '*'),
            os.path.join(RESOURCES_FOLDER_NAME, '**', '*')
        ]
    },
    classifiers=[
        'Programming Language :: Python :: 3.5',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent'
    ],
    cmdclass={
        'copy_resources': CopyResourcesCommand
    }
)
