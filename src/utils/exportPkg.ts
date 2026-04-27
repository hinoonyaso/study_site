import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const exportRos2Workspace = async (fileName: string, language: "cpp" | "python", code: string) => {
  const zip = new JSZip();
  const pkgName = "study_practice_pkg";

  const pkgXml = `<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>${pkgName}</name>
  <version>0.0.0</version>
  <description>Physical AI Lab Practice</description>
  <maintainer email="student@example.com">Student</maintainer>
  <license>Apache-2.0</license>
  
  <buildtool_depend>${language === "cpp" ? "ament_cmake" : "ament_python"}</buildtool_depend>
  <depend>rclcpp</depend>
  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>geometry_msgs</depend>
  <depend>sensor_msgs</depend>

  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>${language === "cpp" ? "ament_cmake" : "ament_python"}</build_type>
  </export>
</package>
`;

  zip.file(`${pkgName}/package.xml`, pkgXml);

  if (language === "cpp") {
    const cmakeLists = `cmake_minimum_required(VERSION 3.8)
project(${pkgName})

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)

add_executable(practice_node src/main.cpp)
ament_target_dependencies(practice_node rclcpp std_msgs geometry_msgs sensor_msgs)

install(TARGETS
  practice_node
  DESTINATION lib/\${PROJECT_NAME}
)

ament_package()
`;
    zip.file(`${pkgName}/CMakeLists.txt`, cmakeLists);
    zip.file(`${pkgName}/src/main.cpp`, code);
  } else {
    const setupPy = `from setuptools import find_packages, setup

package_name = '${pkgName}'

setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='student',
    maintainer_email='student@example.com',
    description='Physical AI Lab Practice',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'practice_node = ${pkgName}.main:main'
        ],
    },
)
`;
    zip.file(`${pkgName}/resource/${pkgName}`, "");
    const setupCfg = `[develop]
script_dir=$base/lib/${pkgName}
[install]
install_scripts=$base/lib/${pkgName}`;

    zip.file(`${pkgName}/setup.cfg`, setupCfg);
    zip.file(`${pkgName}/setup.py`, setupPy);
    zip.file(`${pkgName}/${pkgName}/__init__.py`, "");
    zip.file(`${pkgName}/${pkgName}/main.py`, code);
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${fileName}_workspace.zip`);
};
