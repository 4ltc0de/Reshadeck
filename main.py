import os

from click import get_app_dir
import decky_plugin
from pathlib import Path
import json
import os
import subprocess
import sys
import shutil
import time
import asyncio
import traceback

logger = decky_plugin.logger

destination_folder = decky_plugin.DECKY_USER_HOME + "/.local/share/gamescope/reshade/Shaders"
shaders_folder = decky_plugin.DECKY_PLUGIN_DIR + "/shaders"

class Plugin:
    _enabled = False
    _current = "0"

    def _get_all_shaders(self):
        return sorted([str(p.name) for p in Path(destination_folder).glob("*.fx")])

    async def get_shader_list(self):
        shaders = Plugin._get_all_shaders(self)
        return shaders

    async def get_current_shader(self):
        return Plugin._current

    async def apply_shader(self):
        shader = Plugin._current
        logger.info("Applying shader " + shader)
        try:
            ret = subprocess.run([shaders_folder + "/set_shader.sh", shader], capture_output=True)
            logger.info(ret)
        except Exception:
            logger.exception("apply shader")

    async def set_shader(self, shader_name):
        logger.info("Setting and applying shader " + shader_name)
        try:
            env = os.environ.copy()
            env["LD_LIBRARY_PATH"] = ""
            ret = subprocess.run([shaders_folder + "/set_shader.sh", shader_name], capture_output=True,env=env)
            decky_plugin.logger.info(ret)
            Plugin._current = shader_name
        except Exception:
            decky_plugin.logger.exception("setting shader")

    async def _main(self):
        try:
            Path(destination_folder).mkdir(parents=True, exist_ok=True)
            for item in Path(shaders_folder).glob("*.fx"):
                try:
                    shutil.copy(item, destination_folder)
                except Exception:
                    decky_plugin.logger.debug(f"could not copy {item}")
            decky_plugin.logger.info("Initialized")
            decky_plugin.logger.info(str(await Plugin.get_shader_list(self)))
            await Plugin.apply_shader(self)
        except Exception:
            decky_plugin.logger.exception("main")
